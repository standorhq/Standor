import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const analyzeCode = async (code, language, problem) => {
  try {
    const prompt = `You are an expert code reviewer. Analyze the following ${language} code that solves: "${problem}"

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a detailed analysis in JSON format with the following structure:
{
  "timeComplexity": "O(...) with explanation",
  "spaceComplexity": "O(...) with explanation",
  "correctness": <score 0-100>,
  "bugs": ["list of bugs found"],
  "suggestions": ["list of improvement suggestions"],
  "codeStyle": <score 0-100>,
  "overallScore": <score 0-100>,
  "summary": "brief summary of the code quality"
}`;

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'deepseek/deepseek-coder',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
          'X-Title': 'Standor'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        analysis: {
          ...analysis,
          analyzedAt: new Date()
        }
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI Analysis error:', error.message);
    return {
      success: false,
      error: error.message,
      analysis: null
    };
  }
};

// Fallback to local analysis if API fails
export const basicCodeAnalysis = (code, language) => {
  const lines = code.split('\n').length;
  const hasLoops = /for|while|forEach/.test(code);
  const hasRecursion = /function.*\(.*\).*{[\s\S]*\1/.test(code);
  
  let timeComplexity = 'O(n)';
  if (hasRecursion) timeComplexity = 'O(2^n) or O(n!)';
  else if (hasLoops && code.match(/for|while/g)?.length > 1) timeComplexity = 'O(n²)';
  
  return {
    timeComplexity: `Estimated: ${timeComplexity}`,
    spaceComplexity: 'Estimated: O(n)',
    correctness: 70,
    bugs: [],
    suggestions: ['Consider adding error handling', 'Add input validation'],
    codeStyle: 75,
    overallScore: 72,
    summary: 'Basic analysis completed. For detailed analysis, ensure AI service is configured.',
    analyzedAt: new Date()
  };
};
