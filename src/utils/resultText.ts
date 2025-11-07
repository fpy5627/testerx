/**
 * 生成测试结果文本分析（基于PRD规范）
 * 根据category得分生成心理学解释文本
 * @param normalized 归一化分数（0-100）
 * @param orientationSpectrum Kinsey光谱值（0-7，可选）
 * @param locale 语言环境（'zh' 或 'en'，默认为 'en'）
 * @returns 文本分析结果
 */
export function generateResultText(
  normalized: Record<string, number>,
  orientationSpectrum?: number,
  locale: string = 'en'
): string {
  const isZh = locale === 'zh' || locale.startsWith('zh');
  const parts: string[] = [];

  // Dominance 类别
  if (normalized.Dominance !== undefined) {
    const score = normalized.Dominance;
    if (score > 70) {
      parts.push(
        isZh
          ? "你在引导亲密关系的节奏与流动中找到了深层的满足感。掌控主导权对你而言自然而有力，让你能够通过深思熟虑的引导和自信的决策来创造有意义的体验。这种偏好反映了你对自身欲望的深刻理解，以及以清晰和意图塑造连接动态的意愿。"
          : "You find profound satisfaction in guiding the rhythm and flow of intimate connections. Taking the lead feels natural and empowering, allowing you to create meaningful experiences through thoughtful direction and confident decision-making. This preference reflects a deep understanding of your own desires and a willingness to shape the dynamics of connection with clarity and intention."
      );
    } else if (score >= 60) {
      parts.push(
        isZh
          ? "你展现出一种平衡的主导倾向，在需要的时候能够自然地承担引导角色。这种能力让你能够在关系中创造结构，同时保持对伴侣需求的敏感。"
          : "You display a balanced dominance tendency, naturally assuming a guiding role when needed. This ability allows you to create structure in relationships while remaining sensitive to your partner's needs."
      );
    } else if (score < 40) {
      parts.push(
        isZh
          ? "你更倾向于在关系中建立平等的对话和协作的动态，而不是单方面主导。这种偏好反映了你对共同创造和相互尊重的深刻理解。"
          : "You prefer to establish equal dialogue and collaborative dynamics in relationships rather than unilateral dominance. This preference reflects a deep understanding of co-creation and mutual respect."
      );
    }
  }

  // Submission 类别
  if (normalized.Submission !== undefined) {
    const score = normalized.Submission;
    if (score > 70) {
      parts.push(
        isZh
          ? "向深爱的人交出控制权，对你而言有着独特的美感。你在结构中发现自由，在放手与让伴侣引导旅程的过程中找到平静与满足。这种愿意屈服的意愿反映了深刻的信任、情感智慧，以及对创造最深纽带的那种脆弱性的欣赏。"
          : "There is a unique beauty in surrendering control to someone you trust deeply. You discover freedom within structure, finding peace and fulfillment in letting go and allowing your partner to guide the journey. This willingness to yield reflects profound trust, emotional intelligence, and an appreciation for the vulnerability that creates the deepest bonds."
      );
    } else if (score >= 60) {
      parts.push(
        isZh
          ? "当信任和安全建立后，你展现出一种优雅的开放态度，愿意在适当的时候跟随伴侣的引导。这种平衡反映了你对关系动态的深刻理解，知道何时放手，何时参与。"
          : "When trust and safety are established, you display an elegant openness to following your partner's lead at appropriate moments. This balance reflects a deep understanding of relationship dynamics, knowing when to let go and when to engage."
      );
    } else if (score < 40) {
      parts.push(
        isZh
          ? "你倾向于保持独立性和自主性，偏好在关系动态中平等参与和共同决策。这种偏好反映了你对相互尊重和共同创造的深刻理解。"
          : "You tend to maintain independence and autonomy, preferring equal participation and shared decision-making in relationship dynamics. This preference reflects a deep understanding of mutual respect and co-creation."
      );
    }
  }

  // Switch 类别
  if (normalized.Switch !== undefined) {
    const score = normalized.Switch;
    if (score > 70) {
      parts.push(
        isZh
          ? "你的情感图景如流水般优美，让你能够优雅地在不同角色间移动，取决于当下的时刻、伴侣以及你正在建立的连接。这种适应性反映了情感成熟度，以及对亲密关系并非固定而是动态的深刻理解——这是一支双方都可以引领和跟随的舞蹈，通过平衡创造和谐。"
          : "Your emotional landscape is beautifully fluid, allowing you to move gracefully between different roles depending on the moment, the partner, and the connection you're building. This adaptability reflects emotional maturity and a deep understanding that intimacy is not fixed but dynamic—a dance where both partners can lead and follow, creating harmony through balance."
      );
    } else if (score >= 60) {
      parts.push(
        isZh
          ? "你展现出一种灵活的适应性，能够根据情境和伴侣的需求调整自己的角色。这种能力反映了你对关系动态的敏感理解，知道何时引导，何时跟随。"
          : "You display a flexible adaptability, able to adjust your role based on context and partner needs. This ability reflects a sensitive understanding of relationship dynamics, knowing when to lead and when to follow."
      );
    }
  }

  // Sadistic 类别
  if (normalized.Sadistic !== undefined) {
    const score = normalized.Sadistic;
    if (score > 70) {
      parts.push(
        isZh
          ? "在精心协商的边界内，你在行使权威和控制中找到了满足感。这种偏好并非关于伤害，而是关于来自结构化权力动态的心理深度。它反映了对同意、信任以及权力在亲密语境中可以被分享和体验的复杂方式的深刻理解。"
          : "Within carefully negotiated boundaries, you find fulfillment in exercising authority and control. This preference is not about harm, but about the psychological depth that comes from structured power dynamics. It reflects a sophisticated understanding of consent, trust, and the complex ways in which power can be shared and experienced in intimate contexts."
      );
    } else if (score >= 60) {
      parts.push(
        isZh
          ? "你对涉及结构化控制或权威动态的场景表现出一定的兴趣和开放态度。这种偏好反映了你对关系动态复杂性的理解，以及对在安全、同意的框架内探索权力交换的意愿。"
          : "You show some interest and openness to scenarios involving structured control or authority dynamics. This preference reflects your understanding of the complexity of relationship dynamics and a willingness to explore power exchange within safe, consensual frameworks."
      );
    }
  }

  // Masochistic 类别
  if (normalized.Masochistic !== undefined) {
    const score = normalized.Masochistic;
    if (score > 70) {
      parts.push(
        isZh
          ? "你在向赢得你完全信任的人交出控制权中发现了深层的满足感。这种偏好诉说着脆弱和屈服的深层心理回报——不是作为弱点，而是作为通过不同视角体验亲密关系的自觉选择。它反映了勇气、信任，以及对放手转化力量的欣赏。"
          : "You discover profound satisfaction in relinquishing control to someone who has earned your complete trust. This preference speaks to the deep psychological rewards of vulnerability and surrender—not as weakness, but as a conscious choice to experience intimacy through a different lens. It reflects courage, trust, and an appreciation for the transformative power of letting go."
      );
    } else if (score >= 60) {
      parts.push(
        isZh
          ? "你对与信任的伴侣一起体验受控强度的经历表现出一定的开放态度。这种意愿反映了你对关系动态复杂性的理解，以及对在安全、同意的框架内探索脆弱和屈服的意愿。"
          : "You show some openness to experiences involving controlled intensity with trusted partners. This willingness reflects your understanding of the complexity of relationship dynamics and a desire to explore vulnerability and surrender within safe, consensual frameworks."
      );
    }
  }

  // Vanilla 类别
  if (normalized.Vanilla !== undefined) {
    const score = normalized.Vanilla;
    if (score > 70) {
      parts.push(
        isZh
          ? "你珍视亲密连接中简单与真实的美丽。传统的表达形式与你产生深刻共鸣，不是因为它们有限，而是因为它们提供了清晰、舒适和真正的连接。这种偏好反映了对人类连接永恒方式的欣赏——通过温柔、沟通，以及真正与另一个人同在的深刻简单。"
          : "You cherish the beauty of simplicity and authenticity in intimate connections. Traditional forms of expression resonate deeply with you, not because they are limited, but because they offer clarity, comfort, and genuine connection. This preference reflects an appreciation for the timeless ways humans connect—through tenderness, communication, and the profound simplicity of being truly present with another person."
      );
    } else if (score >= 60) {
      parts.push(
        isZh
          ? "你倾向于传统的关系结构，同时保持对探索的开放态度。这种平衡反映了你对熟悉与新奇之间微妙平衡的深刻理解，知道何时拥抱传统，何时尝试新的表达方式。"
          : "You tend toward conventional relationship structures while remaining open to exploration. This balance reflects a deep understanding of the delicate balance between familiarity and novelty, knowing when to embrace tradition and when to try new forms of expression."
      );
    }
  }

  // Exploration 类别
  if (normalized.Exploration !== undefined) {
    const score = normalized.Exploration;
    if (score > 70) {
      parts.push(
        isZh
          ? "你对人类亲密与表达的广阔图景的好奇心几乎没有边界。你以开放的心灵和思想接近新体验，将每一次相遇视为发现更多关于自己、伴侣以及连接可以被表达的无限方式的机会。这种开放反映了智力好奇心、情感勇气，以及对人类体验丰富性的深刻欣赏。"
          : "Your curiosity about the vast landscape of human intimacy and expression knows few bounds. You approach new experiences with an open heart and mind, seeing each encounter as an opportunity to discover more about yourself, your partner, and the infinite ways connection can be expressed. This openness reflects intellectual curiosity, emotional courage, and a deep appreciation for the richness of human experience."
      );
    } else if (score >= 60) {
      parts.push(
        isZh
          ? "你对不同的关系动态和表达形式表现出适度的好奇心。这种开放态度反映了你对人类体验多样性的欣赏，以及愿意在安全、同意的框架内探索新的连接方式。"
          : "You show moderate curiosity about different relationship dynamics and forms of expression. This openness reflects your appreciation for the diversity of human experience and a willingness to explore new ways of connecting within safe, consensual frameworks."
      );
    } else if (score < 40) {
      parts.push(
        isZh
          ? "你偏好熟悉和既定的关系模式，在已知的领域中找到舒适和安全感。这种偏好反映了你对稳定性和可预测性的重视，以及对在熟悉框架内建立深刻连接的欣赏。"
          : "You prefer familiar and established patterns in relationships, finding comfort and security in known territories. This preference reflects your value for stability and predictability, and an appreciation for building deep connections within familiar frameworks."
      );
    }
  }

  // Orientation 光谱（Kinsey-like）
  if (orientationSpectrum !== undefined) {
    if (orientationSpectrum <= 1) {
      parts.push(
        isZh
          ? "你的回答反映了对异性的主要吸引力，这种倾向在类似Kinsey光谱上位于0-1的位置。这种取向反映了你对异性伴侣的深刻连接和吸引力。"
          : "Your responses reflect a primary attraction to the opposite gender, positioning you at 0-1 on the Kinsey-like spectrum. This orientation reflects your deep connection and attraction to opposite-gender partners."
      );
    } else if (orientationSpectrum <= 3) {
      parts.push(
        isZh
          ? "你的回答展现了一种流动的性取向光谱，可能认同为双性恋、泛性恋或其他多元性取向，表现出对不同性别的吸引力（在类似Kinsey光谱上为2-3）。这种多样性反映了人类性取向的丰富性和复杂性。"
          : "Your responses reveal a fluid sexual orientation spectrum, potentially identifying as bisexual, pansexual, or other diverse orientations, showing attraction across a spectrum of genders (2-3 on the Kinsey-like spectrum). This diversity reflects the richness and complexity of human sexual orientation."
      );
    } else if (orientationSpectrum <= 5) {
      parts.push(
        isZh
          ? "你的回答表明对同性的强烈吸引倾向，可能主要认同为同性恋（在类似Kinsey光谱上为4-5）。这种取向反映了你对同性伴侣的深刻连接和吸引力。"
          : "Your responses indicate a strong same-gender attraction tendency, potentially identifying as predominantly homosexual (4-5 on the Kinsey-like spectrum). This orientation reflects your deep connection and attraction to same-gender partners."
      );
    } else if (orientationSpectrum <= 7) {
      parts.push(
        isZh
          ? "你的回答表明主要是同性恋倾向，或者可能表现出无性/无浪漫倾向（在类似Kinsey光谱上为6-7）。这种取向反映了人类性取向光谱的多样性，以及每个人独特的连接和吸引方式。"
          : "Your responses suggest a primarily homosexual orientation, or potentially asexual/aromantic tendencies (6-7 on the Kinsey-like spectrum). This orientation reflects the diversity of the human sexual orientation spectrum and each person's unique way of connecting and experiencing attraction."
      );
    }
  }

  // 如果没有生成任何部分，添加通用说明
  if (parts.length === 0) {
    parts.push(
      isZh
        ? "你的回答在不同维度的关系偏好上显示出平衡的轮廓。"
        : "Your responses show a balanced profile across different dimensions of relationship preferences."
    );
  }

  // 添加免责声明
  parts.push(
    isZh
      ? "\n\n请记住：这些结果反映的是倾向和偏好，而不是固定的标签或诊断结论。人类心理是复杂和流动的，本测试仅用于自我反思和教育目的。在任何关系动态中，始终优先考虑同意、安全和沟通。"
      : "\n\nRemember: These results reflect tendencies and preferences, not fixed labels or diagnostic conclusions. Human psychology is complex and fluid, and this test is for self-reflection and educational purposes only. Always prioritize consent, safety, and communication in any relationship dynamic."
  );

  return parts.join("\n\n");
}
