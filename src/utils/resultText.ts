/**
 * 生成测试结果文本分析（基于PRD规范）
 * 根据category得分生成心理学解释文本
 * @param normalized 归一化分数（0-100）
 * @param orientationSpectrum Kinsey光谱值（0-7，可选）
 * @returns 文本分析结果
 */
export function generateResultText(
  normalized: Record<string, number>,
  orientationSpectrum?: number
): string {
  const parts: string[] = [];

  // Dominance 类别
  if (normalized.Dominance !== undefined) {
    const score = normalized.Dominance;
    if (score > 70) {
      parts.push(
        "You show a strong preference for taking initiative and leadership in relationships. This suggests you feel comfortable and confident when directing the pace and flow of intimate interactions."
      );
    } else if (score >= 60) {
      parts.push(
        "You display moderate dominance tendencies, with a balanced inclination toward taking control when appropriate."
      );
    } else if (score < 40) {
      parts.push(
        "You prefer collaborative or shared decision-making rather than taking a dominant role."
      );
    }
  }

  // Submission 类别
  if (normalized.Submission !== undefined) {
    const score = normalized.Submission;
    if (score > 70) {
      parts.push(
        "You find comfort in yielding control and trusting your partner's decisions. This indicates a preference for structure and guidance in intimate relationships."
      );
    } else if (score >= 60) {
      parts.push(
        "You show moderate openness to following a partner's lead when trust and safety are established."
      );
    } else if (score < 40) {
      parts.push(
        "You tend to maintain independence and prefer equal participation in relationship dynamics."
      );
    }
  }

  // Switch 类别
  if (normalized.Switch !== undefined) {
    const score = normalized.Switch;
    if (score > 70) {
      parts.push(
        "You demonstrate strong flexibility in adapting your role based on context, mood, and partner needs. This versatility adds depth to your relationships."
      );
    } else if (score >= 60) {
      parts.push(
        "You show some willingness to adapt your role depending on the situation."
      );
    }
  }

  // Sadistic 类别
  if (normalized.Sadistic !== undefined) {
    const score = normalized.Sadistic;
    if (score > 70) {
      parts.push(
        "You experience satisfaction from exercising authority or control in consensual contexts. This is a valid psychological preference when practiced ethically and with mutual consent."
      );
    } else if (score >= 60) {
      parts.push(
        "You show some interest in scenarios involving structured control or authority dynamics."
      );
    }
  }

  // Masochistic 类别
  if (normalized.Masochistic !== undefined) {
    const score = normalized.Masochistic;
    if (score > 70) {
      parts.push(
        "You derive satisfaction from experiencing controlled intensity or challenge. This preference involves trust, boundaries, and consensual dynamics."
      );
    } else if (score >= 60) {
      parts.push(
        "You show some openness to experiences involving controlled intensity with trusted partners."
      );
    }
  }

  // Vanilla 类别
  if (normalized.Vanilla !== undefined) {
    const score = normalized.Vanilla;
    if (score > 70) {
      parts.push(
        "You prefer traditional, straightforward forms of emotional and physical connection. This reflects a comfort with conventional relationship dynamics."
      );
    } else if (score >= 60) {
      parts.push(
        "You tend toward conventional relationship structures while remaining open to exploration."
      );
    }
  }

  // Exploration 类别
  if (normalized.Exploration !== undefined) {
    const score = normalized.Exploration;
    if (score > 70) {
      parts.push(
        "You're highly open to experimenting with emotional or physical boundaries and exploring new forms of intimacy and expression."
      );
    } else if (score >= 60) {
      parts.push(
        "You show moderate curiosity about different relationship dynamics and forms of expression."
      );
    } else if (score < 40) {
      parts.push(
        "You prefer familiar and established patterns in relationships."
      );
    }
  }

  // Orientation 光谱（Kinsey-like）
  if (orientationSpectrum !== undefined) {
    if (orientationSpectrum <= 1) {
      parts.push(
        "Your responses suggest a primarily heterosexual orientation (0-1 on the Kinsey-like spectrum)."
      );
    } else if (orientationSpectrum <= 3) {
      parts.push(
        "You may identify with bisexual, pansexual, or fluid orientations, showing attraction across a spectrum of genders (2-3 on the Kinsey-like spectrum)."
      );
    } else if (orientationSpectrum <= 5) {
      parts.push(
        "Your responses indicate a strong same-gender attraction tendency, potentially identifying as predominantly homosexual (4-5 on the Kinsey-like spectrum)."
      );
    } else if (orientationSpectrum <= 7) {
      parts.push(
        "Your responses suggest a primarily homosexual orientation or asexual/aromantic tendencies (6-7 on the Kinsey-like spectrum)."
      );
    }
  }

  // 如果没有生成任何部分，添加通用说明
  if (parts.length === 0) {
    parts.push(
      "Your responses show a balanced profile across different dimensions of relationship preferences."
    );
  }

  // 添加免责声明
  parts.push(
    "\n\nRemember: These results reflect tendencies and preferences, not fixed labels or diagnostic conclusions. Human psychology is complex and fluid, and this test is for self-reflection and educational purposes only. Always prioritize consent, safety, and communication in any relationship dynamic."
  );

  return parts.join(" ");
}
