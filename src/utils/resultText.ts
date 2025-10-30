export function generateResultText(scores: Record<string, number>): string {
  let text = '';
  if (scores.Dominance && scores.Dominance > 70)
    text += 'You show a strong preference for taking initiative and leadership in relationships. ';
  if (scores.Submission && scores.Submission > 70)
    text += 'You find comfort in yielding control and trusting your partner\'s decisions. ';
  if (scores.Exploration && scores.Exploration > 60)
    text += 'You’re open to experimenting with emotional or physical boundaries. ';
  if (scores.Orientation !== undefined) {
    if (scores.Orientation < 20)
      text += 'You are likely to identify as mostly straight. ';
    else if (scores.Orientation < 60)
      text += 'You may show some levels of flexibility (bi/pan/fluid). ';
    else if (scores.Orientation < 90)
      text += 'You have a strong same-gender attraction tendency. ';
    else
      text += 'Signs of asexual/aromantic tendencies are present. ';
  }
  return text + 'Remember, these results reflect tendencies, not fixed labels.';
}
