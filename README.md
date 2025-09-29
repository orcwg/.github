# ORCWG GitHub Profile

This repository provides the content that populates the working group's Github Organization [profile page](https://github.com/orcwg).

## Auto-populating Events list

To ensure the event list on the profile page stays current, a [script](update-events.js) is used to call the Ecplipse Newsroom API, which is set as a GitHub repository variable in this project.

A daily GitHub action [script](workflows/update_readme.yml) runs daily to ensure the event list is up to date.