---
title: 'Home'
date: 2023-10-24
type: landing

design:
  # Default section spacing
  spacing: "2rem"

# Note: `username` refers to the user's folder name in `content/authors/`

# Page sections
sections:
  - block: resume-biography-3
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: admin
      text: ""
      # Show a call-to-action button under your biography? (optional)
      button:
        text: Download Résumé
        url: uploads/resume.pdf
    design:
      banner:
        # Upload your cover image to the `assets/media/` folder and reference it here
        filename: canada5.jpg
      biography:
        # Customize the style of your biography text
        style: 'text-align: justify; font-size: 0.8em;'
  - block: better-experience
    content:
      username: admin
      title: Selected Experience
    design:
      # Hugo date format
      date_format: 'January 2006'
  - block: collection
    content:
      title: Selected Projects
      text: Building is my form of expression. Here are a selection of projects that I have worked on over the years.
      filters:
        folders:
          - project
    design:
      view: article-grid
      fill_image: false
      show_dates: true
      columns: 3
---
