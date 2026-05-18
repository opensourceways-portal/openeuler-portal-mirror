import { ghApi, log } from './kubectl.js';

export async function resolvePr(repo, pr, token) {
  const info = JSON.parse(await ghApi(`/repos/${repo}/pulls/${pr}`, { token }));
  const head = info.head || {};
  const branch = head.ref;
  const sha = head.sha || '';
  const cloneUrl = (head.repo && head.repo.clone_url) || `https://github.com/${repo}.git`;
  if (!branch) throw new Error(`无法解析 PR ${repo}#${pr} 的头分支`);
  return { branch, sha, cloneUrl };
}

export function parseIssueFromBranch(branch, fallbackPr) {
  const m = /^feature\/issue-(\d+)$/.exec(branch || '');
  if (m) return m[1];
  return String(fallbackPr);
}
