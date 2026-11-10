import { record } from 'rrweb';
import { sessionReplayApi, sysConfigApi, taskApi } from './api';

class SessionReplayService {
  private stopRecordingFn: (() => void) | null = null;
  private eventBuffer: any[] = [];
  private sessionGuid: string | null = null;
  private mbrId: string | null = null;
  private chunkIndex = 0;
  private totalEventsRecorded = 0;
  private totalErrorsRecorded = 0;
  private startTime = 0;
  private flushTimer: any = null;
  private isFlushing = false;
  private isEnabled = true;

  public async init(explicitMbrId?: string): Promise<void> {
    if (this.stopRecordingFn) return;

    // Resolve member ID if not explicitly provided
    let resolvedMbrId = explicitMbrId;
    if (!resolvedMbrId) {
      try {
        const currentMbrStr = sessionStorage.getItem('sb_current_mbr');
        if (currentMbrStr) {
          const parsed = JSON.parse(currentMbrStr);
          if (parsed?.mbrId) resolvedMbrId = parsed.mbrId;
        }
      } catch {}
    }
    if (!resolvedMbrId) {
      try {
        const storedMbr = sessionStorage.getItem('selectedMember') || sessionStorage.getItem('mbr');
        if (storedMbr) {
          const parsed = JSON.parse(storedMbr);
          if (parsed?.mbrId) resolvedMbrId = parsed.mbrId;
        }
      } catch {}
    }
    if (!resolvedMbrId) {
      try {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.user_id) {
            const m = await taskApi.getMemberByUserId(u.user_id).catch(() => null);
            if (m?.mbrId) resolvedMbrId = m.mbrId;
          }
        }
      } catch {}
    }

    // Only record authenticated members
    if (!resolvedMbrId) {
      return;
    }

    // Check system setting FEATURE_SESSION_REPLAY dynamically
    try {
      const config = await sysConfigApi.getSysConfigByTag('FEATURE_SESSION_REPLAY');
      if (config && config.configValue && config.configValue.toLowerCase() === 'false') {
        console.info('[SessionReplay] Session replay is disabled by system setting FEATURE_SESSION_REPLAY.');
        this.isEnabled = false;
        return;
      }

      // Check configurable session sampling rate (0 to 100%)
      const rateConfig = await sysConfigApi.getSysConfigByTag('SESSION_REPLAY_SAMPLE_RATE');
      if (rateConfig && rateConfig.configValue) {
        const sampleRate = parseFloat(rateConfig.configValue);
        if (!isNaN(sampleRate)) {
          if (sampleRate <= 0) {
            console.info('[SessionReplay] Session skipped: sample rate is 0%.');
            this.isEnabled = false;
            return;
          }
          if (sampleRate < 100) {
            const randomRoll = Math.random() * 100;
            if (randomRoll >= sampleRate) {
              console.info(`[SessionReplay] Session excluded by sampling roll (${randomRoll.toFixed(1)} >= ${sampleRate}%).`);
              this.isEnabled = false;
              return;
            }
          }
        }
      }
    } catch (e) {
      // Fallback: continue if config read fails
    }

    this.mbrId = resolvedMbrId;
    this.sessionGuid = `sr_${resolvedMbrId.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.startTime = Date.now();
    this.chunkIndex = 0;
    this.totalEventsRecorded = 0;
    this.totalErrorsRecorded = 0;
    this.eventBuffer = [];

    // Detect browser & device metrics
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const deviceTypeCd = isMobile ? 'MOBILE' : 'DESKTOP';
    const browserName = this.detectBrowser(userAgent);
    const osName = this.detectOS(userAgent);

    // Register initial session record in sb-api
    sessionReplayApi.startSession({
      mbrId: this.mbrId,
      sessionGuid: this.sessionGuid,
      deviceTypeCd,
      browserName,
      osName,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      initialUrl: window.location.pathname + window.location.search,
      gcsPrefix: `session_replays/${this.sessionGuid}/`,
      metadataJson: {
        referrer: document.referrer,
        screenRes: `${window.screen.width}x${window.screen.height}`
      }
    }).catch(err => {
      console.warn('[SessionReplay] Failed to register session start:', err);
    });

    // Attach global window error listener to track client exceptions
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);

    // Start rrweb recorder with strict privacy & PII masking
    try {
      this.stopRecordingFn = record({
        emit: (event) => {
          this.handleEvent(event);
        },
        maskAllInputs: true,
        maskInputOptions: {
          password: true,
          color: false,
          date: false,
          'datetime-local': false,
          email: true,
          month: false,
          number: false,
          range: false,
          search: true,
          tel: true,
          text: true,
          time: false,
          url: false,
          week: false
        },
        maskTextClass: 'sb-mask',
        blockClass: 'sb-block',
        ignoreClass: 'sb-ignore',
        sampling: {
          mousemove: 50,
          mouseInteraction: true,
          scroll: 150,
          input: 'last'
        }
      }) || null;

      // Immediate initial flush of the full DOM snapshot after 1.5 seconds, then every 5 seconds
      setTimeout(() => {
        this.flushBuffer(false);
      }, 1500);

      this.flushTimer = setInterval(() => {
        this.flushBuffer(false);
      }, 5000);

      // Final flush on beforeunload and visibilitychange (tab hidden / close)
      window.addEventListener('beforeunload', this.handleBeforeUnload);
      document.addEventListener('visibilitychange', this.handleVisibilityChange);

      console.info(`[SessionReplay] Initialized for member ${resolvedMbrId} (Session: ${this.sessionGuid})`);
    } catch (err) {
      console.error('[SessionReplay] Failed to start rrweb recording:', err);
    }
  }

  private handleEvent(event: any): void {
    this.eventBuffer.push(event);
    this.totalEventsRecorded++;

    if (this.eventBuffer.length >= 25) {
      this.flushBuffer(false);
    }
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.flushBuffer(false);
    }
  };

  private handleWindowError = (event: ErrorEvent) => {
    this.totalErrorsRecorded++;
    this.eventBuffer.push({
      type: 99, // Custom diagnostic error marker
      data: {
        tag: 'client_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        timestamp: Date.now()
      }
    });
  };

  private handlePromiseRejection = (event: PromiseRejectionEvent) => {
    this.totalErrorsRecorded++;
    this.eventBuffer.push({
      type: 99,
      data: {
        tag: 'unhandled_promise',
        reason: String(event.reason),
        timestamp: Date.now()
      }
    });
  };

  private handleBeforeUnload = () => {
    this.stop();
  };

  public async flushBuffer(isFinal = false): Promise<void> {
    if (this.isFlushing || this.eventBuffer.length === 0 || !this.sessionGuid) return;

    this.isFlushing = true;
    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];
    const currentIndex = this.chunkIndex++;

    try {
      const payloadString = JSON.stringify(eventsToFlush);
      await sessionReplayApi.uploadChunk(this.sessionGuid, currentIndex, payloadString, isFinal);

      // Periodically update session status in sb-api
      const durationSec = Math.round((Date.now() - this.startTime) / 10) / 100;
      await sessionReplayApi.completeSession(this.sessionGuid, {
        statusCd: isFinal ? 'COMPLETED' : 'RECORDING',
        durationSec,
        eventCount: this.totalEventsRecorded,
        errorCount: this.totalErrorsRecorded,
        ...(isFinal ? { endTs: new Date().toISOString() } : {})
      });
    } catch (err) {
      console.warn('[SessionReplay] Failed to flush chunk:', err);
      // Re-queue events if network upload failed (except on final exit)
      if (!isFinal) {
        this.eventBuffer.unshift(...eventsToFlush);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  public stop(): void {
    if (this.stopRecordingFn) {
      try {
        this.stopRecordingFn();
      } catch (e) {
        // ignore
      }
      this.stopRecordingFn = null;
    }

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.sessionGuid) {
      this.flushBuffer(true).catch(() => {});
    }
  }

  private detectBrowser(ua: string): string {
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    if (ua.includes('Trident')) return 'Internet Explorer';
    if (ua.includes('Edge') || ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  private detectOS(ua: string): string {
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('like Mac')) return 'iOS';
    return 'Unknown';
  }
}

export const sessionReplayService = new SessionReplayService();
