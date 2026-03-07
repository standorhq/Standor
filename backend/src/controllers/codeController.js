import { executeCode, getSupportedLanguages } from '../lib/piston.js';

export const runCode = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const result = await executeCode(code, language, stdin);

    res.json({
      success: result.success,
      output: result.output,
      error: result.error,
      exitCode: result.exitCode
    });
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ error: 'Failed to execute code' });
  }
};

export const getLanguages = async (req, res) => {
  try {
    const languages = await getSupportedLanguages();
    res.json({
      success: true,
      languages
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
};
