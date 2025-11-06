import { NextResponse } from "next/server";

/**
 * 心理测试安慰性标语库
 * 适合心理测试场景的鼓励和安慰性标语
 */
const slogans = {
  zh: [
    "每一个答案都是真实的你，没有对错之分",
    "慢慢来，不用着急，你的感受最重要",
    "这是一个了解自己的过程，请诚实地回答",
    "没有标准答案，只有属于你的答案",
    "你的每一个选择都值得被尊重",
    "这是一个安全的空间，你可以自由表达",
    "探索自己需要勇气，你已经很勇敢了",
    "每个人的答案都是独特的，你的也不例外",
    "请相信，你的感受是真实且重要的",
    "这是一个自我发现的过程，享受它吧",
    "没有完美的人，只有真实的自己",
    "你的答案反映了真实的你，这很珍贵",
    "慢慢思考，不用着急，时间属于你",
    "每一个问题都是了解自己的机会",
    "请诚实地面对自己，这是成长的第一步",
    "你的感受和想法都很重要",
    "这是一个没有评判的空间",
    "探索内心需要时间，给自己一些耐心",
    "每一个答案都是你的一部分",
    "请相信，真实的自己就是最好的",
    "这是一个自我接纳的过程",
    "你的答案没有好坏之分",
    "慢慢来，每一步都是进步",
    "请诚实地回答，这是对自己的尊重",
    "探索自己需要勇气，你已经做到了",
  ],
  en: [
    "Every answer is the real you, there's no right or wrong",
    "Take your time, your feelings matter most",
    "This is a journey of self-discovery, please answer honestly",
    "There are no standard answers, only your answers",
    "Every choice you make deserves respect",
    "This is a safe space where you can express freely",
    "Exploring yourself takes courage, and you're already brave",
    "Everyone's answers are unique, and so are yours",
    "Please believe that your feelings are real and important",
    "This is a process of self-discovery, enjoy it",
    "There are no perfect people, only authentic selves",
    "Your answers reflect the real you, and that's precious",
    "Think slowly, no rush, time is yours",
    "Every question is an opportunity to know yourself",
    "Please face yourself honestly, this is the first step to growth",
    "Your feelings and thoughts are all important",
    "This is a space without judgment",
    "Exploring your inner self takes time, be patient with yourself",
    "Every answer is part of you",
    "Please believe that the real you is the best",
    "This is a process of self-acceptance",
    "Your answers have no good or bad",
    "Take it slow, every step is progress",
    "Please answer honestly, this is respect for yourself",
    "Exploring yourself takes courage, and you've already done it",
  ],
};

/**
 * 从外部API获取标语（可选）
 * 如果外部API失败，则使用内置标语库
 */
async function fetchSloganFromAPI(locale: string, pageIndex: number): Promise<string | null> {
  try {
    // 这里可以调用外部API，例如：
    // const response = await fetch(`https://api.example.com/slogans?locale=${locale}&page=${pageIndex}`);
    // if (response.ok) {
    //   const data = await response.json();
    //   return data.slogan;
    // }
    return null;
  } catch (error) {
    console.error("Failed to fetch slogan from API:", error);
    return null;
  }
}

/**
 * 获取标语
 * GET /api/test/slogan?locale=zh&page=0
 */
export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const locale = (searchParams.get("locale") || "zh") as "zh" | "en";
    const pageIndex = parseInt(searchParams.get("page") || "0", 10);

    // 尝试从外部API获取
    const externalSlogan = await fetchSloganFromAPI(locale, pageIndex);
    if (externalSlogan) {
      return NextResponse.json({ slogan: externalSlogan });
    }

    // 使用内置标语库
    const localeSlogans = slogans[locale] || slogans.zh;
    
    // 根据页面索引和当前时间选择不同的标语
    const timeBasedIndex = Math.floor(Date.now() / (10 * 60 * 1000)); // 每10分钟变化
    const combinedIndex = (pageIndex * 7 + timeBasedIndex) % localeSlogans.length;
    
    const slogan = localeSlogans[combinedIndex];

    return NextResponse.json({ slogan });
  } catch (error) {
    console.error("Failed to get slogan:", error);
    const defaultSlogan = slogans.zh[0];
    return NextResponse.json({ slogan: defaultSlogan });
  }
}

