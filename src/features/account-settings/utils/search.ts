/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Checks if a string matches a wildcard pattern containing '*'
 */
export const matchWildcard = (str: string, rule: string): boolean => {
  const escapeRegex = (s: string) => s.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  const regexRule = "^" + rule.split("*").map(escapeRegex).join(".*") + "$";
  return new RegExp(regexRule, "i").test(str);
};

/**
 * Filter users based on input query (supporting wildcard '*')
 */
export const matchUser = (username: string, query: string): boolean => {
  if (!query) return true;
  if (query.includes('*')) {
    return matchWildcard(username, query);
  }
  return username.toLowerCase().includes(query.toLowerCase());
};
