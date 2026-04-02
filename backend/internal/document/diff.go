package document

import "strings"

type DiffStats struct {
	Additions     int
	Deletions     int
	Modifications int
}

func calculateDiffStats(previousContent, nextContent string) DiffStats {
	previousLines := splitDocumentLines(previousContent)
	nextLines := splitDocumentLines(nextContent)

	lcs := longestCommonSubsequenceLength(previousLines, nextLines)
	additions := len(nextLines) - lcs
	deletions := len(previousLines) - lcs
	modifications := min(additions, deletions)

	return DiffStats{
		Additions:     additions - modifications,
		Deletions:     deletions - modifications,
		Modifications: modifications,
	}
}

func splitDocumentLines(content string) []string {
	if content == "" {
		return nil
	}

	normalized := strings.ReplaceAll(content, "\r\n", "\n")
	normalized = strings.ReplaceAll(normalized, "\r", "\n")
	lines := strings.Split(normalized, "\n")

	// Treat trailing newline as formatting noise rather than an added empty line.
	if len(lines) > 0 && lines[len(lines)-1] == "" {
		lines = lines[:len(lines)-1]
	}

	return lines
}

func longestCommonSubsequenceLength(left, right []string) int {
	if len(left) == 0 || len(right) == 0 {
		return 0
	}

	prev := make([]int, len(right)+1)
	curr := make([]int, len(right)+1)

	for i := 1; i <= len(left); i++ {
		for j := 1; j <= len(right); j++ {
			if left[i-1] == right[j-1] {
				curr[j] = prev[j-1] + 1
				continue
			}
			curr[j] = max(prev[j], curr[j-1])
		}

		copy(prev, curr)
		clear(curr)
	}

	return prev[len(right)]
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
