# 题库JSON模板说明

## 新格式模板（推荐）

新的JSON模板结构支持更灵活的权重系统，每个问题可以同时影响多个维度。

### 模板结构

```json
{
  "meta": {
    "version": "1.0",
    "language": "en",
    "mode": "standard",
    "question_count": 100
  },
  "dimensions": [
    {
      "id": "dominant",
      "name": "Dominant",
      "description": "Enjoys taking control and leading others."
    }
  ],
  "questions": [
    {
      "id": 1,
      "text": "I enjoy taking control during intimate situations.",
      "options": [
        "Strongly disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly agree"
      ],
      "weights": {
        "dominant": 1.0,
        "submissive": -0.8
      }
    }
  ]
}
```

### 权重计算逻辑

- **Likert量表值映射**：
  - Strongly disagree = 1
  - Disagree = 2
  - Neutral = 3
  - Agree = 4
  - Strongly agree = 5

- **计算公式**：
  ```
  offset = answer_value - 3  // 将3（Neutral）作为零点
  score[dimension] += offset * weight
  ```

- **归一化**：
  最后将所有维度的得分归一化到0-100分区间。

### 权重设计原则

1. **正权重**：表示该答案会增加该维度的得分
   - 例如：`"dominant": 1.0` 表示选择"Agree"会增加dominant维度得分

2. **负权重**：表示该答案会减少该维度的得分
   - 例如：`"submissive": -0.8` 表示选择"Agree"会减少submissive维度得分

3. **多维度影响**：一个问题可以同时影响多个维度
   ```json
   "weights": {
     "dominant": 1.0,
     "submissive": -0.8,
     "switch": 0.3
   }
   ```

### 示例

参考 `test-bank-template.json` 文件，其中包含5个示例问题，展示了如何设计权重系统。

## 旧格式（兼容）

系统仍然支持旧的格式，每个问题只属于一个category，使用单个weight值。

参考 `questions_en.json` 和 `questions_zh.json` 文件。

## 使用建议

1. **每个维度设计10-20题**：确保每个维度都有足够的题目来准确测量
2. **交叉相关**：通过权重系统，一个问题可以同时影响多个维度，实现交叉相关
3. **权重范围**：建议权重值在 -1.5 到 1.5 之间，避免极端值
4. **平衡设计**：确保每个维度既有正向题目，也有反向题目（通过负权重）

