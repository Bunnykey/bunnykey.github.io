export const OPERATOR_PATHS = ['write/', 'workbench/', 'preview/', 'music-tiers/studio/'];

export function includesLocalTools(env = process.env) {
  return env.BUNNYSIDE_LOCAL_TOOLS === '1' && !env.GITHUB_ACTIONS;
}
