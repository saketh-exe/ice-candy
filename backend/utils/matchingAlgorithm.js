/**
 * Text-based matching utility for recommendation scoring
 * Analyzes skills, requirements, and text content to calculate match scores
 */

/**
 * Calculate skill match percentage
 * @param {Array<string>} requiredSkills - Skills required for internship
 * @param {Array<string>} studentSkills - Skills possessed by student
 * @returns {Object} Match percentage and matched skills
 */
export const calculateSkillMatch = (requiredSkills = [], studentSkills = []) => {
    if (!requiredSkills.length) {
        return { percentage: 0, matchedSkills: [], missingSkills: [] };
    }

    // Normalize skills (lowercase, trim)
    const normalizedRequired = requiredSkills.map((s) =>
        s.toLowerCase().trim()
    );
    const normalizedStudent = studentSkills.map((s) => s.toLowerCase().trim());

    // Find exact matches
    const matchedSkills = normalizedRequired.filter((skill) =>
        normalizedStudent.includes(skill)
    );

    // Find partial matches (e.g., "javascript" matches "js")
    const partialMatches = normalizedRequired.filter((reqSkill) =>
        normalizedStudent.some(
            (stuSkill) =>
                stuSkill.includes(reqSkill) || reqSkill.includes(stuSkill)
        )
    );

    // Combine matches (remove duplicates)
    const allMatches = [...new Set([...matchedSkills, ...partialMatches])];

    // Find missing skills
    const missingSkills = requiredSkills.filter(
        (skill) =>
            !allMatches.includes(skill.toLowerCase().trim())
    );

    const percentage = Math.round(
        (allMatches.length / normalizedRequired.length) * 100
    );

    return {
        percentage,
        matchedSkills: allMatches,
        missingSkills,
        totalRequired: requiredSkills.length,
        totalMatched: allMatches.length,
    };
};

/**
 * Calculate text similarity using keyword matching
 * @param {string} text1 - First text (e.g., requirements)
 * @param {string} text2 - Second text (e.g., cover letter)
 * @returns {number} Similarity score (0-100)
 */
export const calculateTextSimilarity = (text1 = '', text2 = '') => {
    if (!text1 || !text2) return 0;

    // Normalize texts
    const normalize = (text) =>
        text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter((word) => word.length > 3); // Filter out short words

    const words1 = normalize(text1);
    const words2 = normalize(text2);

    if (!words1.length || !words2.length) return 0;

    // Count matching words
    const matches = words1.filter((word) => words2.includes(word));
    const uniqueMatches = [...new Set(matches)];

    // Calculate Jaccard similarity
    const union = [...new Set([...words1, ...words2])];
    const similarity = (uniqueMatches.length / union.length) * 100;

    return Math.round(similarity);
};

/**
 * Calculate education match score
 * @param {string} requiredMajor - Required major/field (from requirements text)
 * @param {Array<Object>} studentEducation - Student's education array
 * @returns {number} Match score (0-100)
 */
export const calculateEducationMatch = (
    requiredMajor = '',
    studentEducation = []
) => {
    if (!requiredMajor || !studentEducation.length) return 0;

    const normalizedRequired = requiredMajor.toLowerCase().trim();

    // Check if any education matches
    const hasMatch = studentEducation.some((edu) => {
        const field = (edu.fieldOfStudy || '').toLowerCase();
        const degree = (edu.degree || '').toLowerCase();

        return (
            field.includes(normalizedRequired) ||
            normalizedRequired.includes(field) ||
            degree.includes(normalizedRequired)
        );
    });

    // Check for CGPA bonus (if >= 3.5, add bonus points)
    const highCGPA = studentEducation.some((edu) => edu.cgpa >= 3.5);

    let score = hasMatch ? 80 : 20; // Base score
    if (highCGPA) score = Math.min(100, score + 20); // Bonus for high CGPA

    return score;
};

/**
 * Calculate overall recommendation score
 * @param {Object} params - All matching parameters
 * @returns {Object} Overall score and breakdown
 */
export const calculateRecommendationScore = ({
    requiredSkills = [],
    studentSkills = [],
    internshipRequirements = '',
    coverLetter = '',
    studentMajor = '',
    studentEducation = [],
    studentUniversity = '',
}) => {
    // 1. Skills Match (50% weight)
    const skillMatch = calculateSkillMatch(requiredSkills, studentSkills);
    const skillScore = skillMatch.percentage * 0.5;

    // 2. Text Similarity (30% weight) - Requirements vs Cover Letter
    const textSimilarity = calculateTextSimilarity(
        internshipRequirements,
        coverLetter
    );
    const textScore = textSimilarity * 0.3;

    // 3. Education Match (20% weight)
    const educationScore =
        calculateEducationMatch(internshipRequirements, studentEducation) *
        0.2;

    // Calculate total score
    const totalScore = Math.round(skillScore + textScore + educationScore);

    // Generate match reason
    const matchReason = generateMatchReason(
        skillMatch,
        textSimilarity,
        educationScore > 0,
        totalScore
    );

    return {
        overallScore: Math.min(100, totalScore),
        breakdown: {
            skillScore: Math.round(skillScore),
            textScore: Math.round(textScore),
            educationScore: Math.round(educationScore),
        },
        skillMatch: {
            percentage: skillMatch.percentage,
            matched: skillMatch.matchedSkills.length,
            total: skillMatch.totalRequired,
            matchedSkills: skillMatch.matchedSkills,
            missingSkills: skillMatch.missingSkills,
        },
        matchReason,
    };
};

/**
 * Generate human-readable match reason
 * @param {Object} skillMatch - Skill match results
 * @param {number} textSimilarity - Text similarity score
 * @param {boolean} educationMatch - Whether education matches
 * @param {number} totalScore - Overall score
 * @returns {string} Match reason
 */
const generateMatchReason = (
    skillMatch,
    textSimilarity,
    educationMatch,
    totalScore
) => {
    const reasons = [];

    // Skills analysis
    if (skillMatch.percentage >= 80) {
        reasons.push(
            `Strong skills match (${skillMatch.percentage}% - ${skillMatch.totalMatched}/${skillMatch.totalRequired} skills)`
        );
    } else if (skillMatch.percentage >= 50) {
        reasons.push(
            `Good skills match (${skillMatch.percentage}% - ${skillMatch.totalMatched}/${skillMatch.totalRequired} skills)`
        );
    } else if (skillMatch.percentage > 0) {
        reasons.push(
            `Partial skills match (${skillMatch.percentage}% - ${skillMatch.totalMatched}/${skillMatch.totalRequired} skills)`
        );
    } else {
        reasons.push('Limited skills match');
    }

    // Cover letter analysis
    if (textSimilarity >= 30) {
        reasons.push('Cover letter aligns with requirements');
    } else if (textSimilarity > 0) {
        reasons.push('Some alignment with requirements');
    }

    // Education match
    if (educationMatch) {
        reasons.push('Relevant educational background');
    }

    // Overall assessment
    let assessment = '';
    if (totalScore >= 80) {
        assessment = '⭐ Highly Recommended';
    } else if (totalScore >= 60) {
        assessment = '✓ Recommended';
    } else if (totalScore >= 40) {
        assessment = '~ Consider for Review';
    } else {
        assessment = '⚠ Low Match';
    }

    return `${assessment} - ${reasons.join('; ')}`;
};

/**
 * Extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @returns {Array<string>} Array of keywords
 */
export const extractKeywords = (text = '') => {
    if (!text) return [];

    // Common stop words to exclude
    const stopWords = new Set([
        'the',
        'is',
        'at',
        'which',
        'on',
        'and',
        'or',
        'but',
        'in',
        'with',
        'for',
        'to',
        'of',
        'a',
        'an',
        'as',
        'by',
        'from',
        'this',
        'that',
        'these',
        'those',
        'are',
        'was',
        'were',
        'been',
        'have',
        'has',
        'had',
        'will',
        'would',
        'can',
        'could',
        'should',
    ]);

    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 3 && !stopWords.has(word));

    // Count frequency
    const frequency = {};
    words.forEach((word) => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map((entry) => entry[0]);
};
