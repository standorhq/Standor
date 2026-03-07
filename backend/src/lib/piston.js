import axios from 'axios';

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

// Language mappings for Piston
const languageMap = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'c++',
  c: 'c',
  go: 'go',
  rust: 'rust',
  typescript: 'typescript',
  ruby: 'ruby',
  php: 'php',
  csharp: 'csharp',
  swift: 'swift',
  kotlin: 'kotlin'
};

export const executeCode = async (code, language, stdin = '') => {
  try {
    const pistonLanguage = languageMap[language.toLowerCase()] || language;
    
    const response = await axios.post(`${PISTON_API_URL}/execute`, {
      language: pistonLanguage,
      version: '*',
      files: [{
        content: code
      }],
      stdin: stdin,
      args: [],
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1
    });

    return {
      success: true,
      output: response.data.run.stdout || response.data.run.stderr || '',
      error: response.data.run.stderr || null,
      exitCode: response.data.run.code
    };
  } catch (error) {
    console.error('Piston API error:', error.message);
    return {
      success: false,
      output: '',
      error: error.response?.data?.message || error.message,
      exitCode: 1
    };
  }
};

export const getSupportedLanguages = async () => {
  try {
    const response = await axios.get(`${PISTON_API_URL}/runtimes`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch supported languages:', error.message);
    return [];
  }
};
