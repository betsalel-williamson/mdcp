resource "github_repository" "mdcp" {
  name        = "mdcp"
  description = "MarkDown Context Protocol is an AI Skill that assists with managing documentation"
  homepage_url = "https://www.skills.sh/betsalel-williamson/mdcp"

  visibility = "public"
  archived   = false

  has_issues      = true
  has_projects    = true
  has_wiki        = true
  has_discussions = true

  allow_squash_merge   = true
  allow_merge_commit   = true
  allow_rebase_merge   = true
  allow_auto_merge     = true
  delete_branch_on_merge = false

  squash_merge_commit_title   = "COMMIT_OR_PR_TITLE"
  squash_merge_commit_message = "COMMIT_MESSAGES"
  merge_commit_title          = "MERGE_MESSAGE"
  merge_commit_message        = "PR_TITLE"

  topics = ["ai", "ai-tools", "skills-sh"]

  web_commit_signoff_required = false

  security_and_analysis {
    secret_scanning {
      status = "enabled"
    }
    secret_scanning_push_protection {
      status = "enabled"
    }
  }
}

