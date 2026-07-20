import type { Translations } from '../context/LanguageContext'

export const validateSettings = (
  settings: Record<string, unknown> | undefined,
  t: Translations
): string | null => {
  if (!settings) return null

  const rules: Array<{ condition: boolean; error: string }> = [
    {
      condition: typeof settings.window_size === 'number' && settings.window_size <= 0,
      error: t.error_window_size,
    },
    {
      condition: typeof settings.step_size === 'number' && settings.step_size <= 0,
      error: t.error_step_size,
    },
    {
      condition: typeof settings.rate_similarity === 'number' && settings.rate_similarity < 0,
      error: t.error_rate_similarity,
    },
    {
      condition: typeof settings.permutations_protest === 'number' && settings.permutations_protest < 0,
      error: t.error_permutations_protest,
    },
    {
      condition: typeof settings.bootstrap_threshold === 'number' && settings.bootstrap_threshold < 0,
      error: t.error_bootstrap_threshold,
    },
    {
      condition: typeof settings.dist_threshold === 'number' && settings.dist_threshold < 0,
      error: t.error_dist_threshold,
    },
    {
      condition:
        settings.correlation_threshold_climatic !== undefined &&
        (isNaN(Number(settings.correlation_threshold_climatic)) ||
          Number(settings.correlation_threshold_climatic) < 0 ||
          Number(settings.correlation_threshold_climatic) > 1),
      error: t.error_correlation_threshold,
    },
  ]

  const invalidRule = rules.find((rule) => rule.condition)
  return invalidRule ? invalidRule.error : null
}