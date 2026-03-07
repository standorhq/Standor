// FILE: apps/server/src/data/problems.ts
// 10 curated demo problems for seeding and room creation UI.

export const DEMO_PROBLEMS = [
  {
    title: 'Two Sum',
    difficulty: 'EASY' as const,
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists'],
    tags: ['Array', 'Hash Table'],
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'EASY' as const,
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only'],
    tags: ['String', 'Stack'],
  },
  {
    title: 'Merge Two Sorted Lists',
    difficulty: 'EASY' as const,
    description:
      'Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.',
    examples: [
      { input: 'l1 = [1,2,4], l2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'l1 = [], l2 = []', output: '[]' },
    ],
    constraints: ['0 ≤ list nodes ≤ 50', '-100 ≤ Node.val ≤ 100'],
    tags: ['Linked List', 'Recursion'],
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'MEDIUM' as const,
    description:
      'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3 (abc)' },
      { input: 's = "bbbbb"', output: '1 (b)' },
    ],
    constraints: ['0 ≤ s.length ≤ 5 × 10⁴', 's consists of English letters, digits, symbols and spaces'],
    tags: ['Hash Table', 'String', 'Sliding Window'],
  },
  {
    title: 'LRU Cache',
    difficulty: 'MEDIUM' as const,
    description:
      'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get and put in O(1).',
    examples: [
      { input: 'capacity=2; put(1,1); put(2,2); get(1) → 1; put(3,3); get(2) → -1', output: 'As described' },
    ],
    constraints: ['1 ≤ capacity ≤ 3000', '0 ≤ key, value ≤ 10⁴', 'At most 2×10⁵ calls to get and put'],
    tags: ['Hash Table', 'Linked List', 'Design'],
  },
  {
    title: 'Number of Islands',
    difficulty: 'MEDIUM' as const,
    description:
      "Given an m × n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    examples: [
      { input: '4×5 grid with islands', output: '1' },
      { input: '4×5 grid with multiple islands', output: '3' },
    ],
    constraints: ['1 ≤ m, n ≤ 300', "grid[i][j] is '0' or '1'"],
    tags: ['DFS', 'BFS', 'Union Find', 'Matrix'],
  },
  {
    title: 'Word Search',
    difficulty: 'MEDIUM' as const,
    description:
      'Given an m × n grid of characters board and a string word, return true if word exists in the grid.',
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true' },
    ],
    constraints: ['1 ≤ m, n ≤ 6', '1 ≤ word.length ≤ 15'],
    tags: ['Matrix', 'Backtracking'],
  },
  {
    title: 'Trapping Rain Water',
    difficulty: 'HARD' as const,
    description:
      'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' },
    ],
    constraints: ['n = height.length', '1 ≤ n ≤ 2×10⁴', '0 ≤ height[i] ≤ 10⁵'],
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
  },
  {
    title: 'Median of Two Sorted Arrays',
    difficulty: 'HARD' as const,
    description:
      'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).',
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000' },
    ],
    constraints: ['0 ≤ m, n ≤ 1000', '-10⁶ ≤ nums1[i], nums2[j] ≤ 10⁶'],
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
  },
  {
    title: 'Design URL Shortener (System Design)',
    difficulty: 'HARD' as const,
    description:
      'Design a URL shortening service like bit.ly. Users should be able to shorten a long URL to a short one, and redirect from short to original.',
    examples: [
      { input: 'POST /shorten { url: "https://very-long-url.com" }', output: '{ short: "abc123" }' },
      { input: 'GET /abc123', output: '302 Redirect → original URL' },
    ],
    constraints: [
      '100M URLs generated per day',
      '10:1 read/write ratio',
      'URL expiry after 5 years',
      'No collision',
    ],
    tags: ['System Design', 'Hash Table', 'Database', 'Scalability'],
  },
] as const;
