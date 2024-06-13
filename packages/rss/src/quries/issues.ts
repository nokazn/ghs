import { graphql } from "@octokit/graphql";
import type { SearchResultItemConnection } from "@octokit/graphql-schema";

import type { NameWithOwner } from "../types";

type Init = {
	repositories: NameWithOwner[];
	popularity: {
		type: "reactions" | "comments";
		count: number;
	};
};

// TODO: brand type
type YYYYMMDD = string;

const oneMonthBefore = (date: Date): YYYYMMDD => {
	// HACK: Swedish locale style starts with YYYY-MM-DD
	date.setMonth(date.getMonth() - 1);
	return new Date(date).toLocaleString("sv-SE").slice(0, 10);
};

const queryIssues = (init: Init) => {
	const repos = init.repositories.map((repo) => `repo:${repo}`).join(" ");
	const popularity = `${init.popularity.type}:>${init.popularity.count}`;
	const updated = `updated:>${oneMonthBefore(new Date())}`;
	const query = `${repos} ${popularity} ${updated} is:issue sort:updated`;

	return graphql<{ search: SearchResultItemConnection }>(
		`
    query ($query: String!) {
      search (
        type: ISSUE
        first: 10
        query: $query
      ) {
        issueCount
        edges {
          node {
            __typename
            ... on Issue {
              id
              title
              body
              repository {
                id
                nameWithOwner
              }
              reactions {
                totalCount
              }
              comments (last: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
              updatedAt
              createdAt
            }
          }
        }
      }
    }
    `,
		{
			query,
		},
	);
};
