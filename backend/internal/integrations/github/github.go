package github

import "time"

type PullRequestWebhook struct {
	Action      string      `json:"action"`
	Number      int         `json:"number"`
	PullRequest PullRequest `json:"pull_request"`
	Repository  Repository  `json:"repository"`
	Sender      GitHubUser  `json:"sender"`
}

type PullRequest struct {
	NodeID   string     `json:"node_id"`
	Number   int        `json:"number"`
	Title    string     `json:"title"`
	HTMLURL  string     `json:"html_url"`
	MergedAt *time.Time `json:"merged_at"`
	Draft    bool       `json:"draft"`
	Head     BranchRef  `json:"head"`
	Base     BranchRef  `json:"base"`
	User     GitHubUser `json:"user"`
}

type BranchRef struct {
	Ref string `json:"ref"`
}

type Repository struct {
	FullName string `json:"full_name"`
	Name     string `json:"name"`
}

type GitHubUser struct {
	Login string `json:"login"`
}
