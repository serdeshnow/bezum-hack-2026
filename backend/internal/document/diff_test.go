package document

import "testing"

func TestCalculateDiffStats(t *testing.T) {
	testCases := []struct {
		name     string
		previous string
		next     string
		want     DiffStats
	}{
		{
			name:     "new document from empty content",
			previous: "",
			next:     "line 1\nline 2",
			want: DiffStats{
				Additions:     2,
				Deletions:     0,
				Modifications: 0,
			},
		},
		{
			name:     "single line modified",
			previous: "alpha\nbeta\ngamma",
			next:     "alpha\nbeta updated\ngamma",
			want: DiffStats{
				Additions:     0,
				Deletions:     0,
				Modifications: 1,
			},
		},
		{
			name:     "line added and line removed",
			previous: "alpha\nbeta\ngamma",
			next:     "alpha\ngamma\ndelta",
			want: DiffStats{
				Additions:     0,
				Deletions:     0,
				Modifications: 1,
			},
		},
		{
			name:     "mixed additions modifications and deletions",
			previous: "a\nb\nc\nd",
			next:     "a\nb updated\nc\ne\nf",
			want: DiffStats{
				Additions:     1,
				Deletions:     0,
				Modifications: 2,
			},
		},
		{
			name:     "trailing newline ignored",
			previous: "a\nb\n",
			next:     "a\nb",
			want: DiffStats{
				Additions:     0,
				Deletions:     0,
				Modifications: 0,
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got := calculateDiffStats(tc.previous, tc.next)
			if got != tc.want {
				t.Fatalf("diff stats = %+v, want %+v", got, tc.want)
			}
		})
	}
}
