import { graphql } from "@octokit/graphql";
import type { Maybe, Repository, User } from "@octokit/graphql-schema";

const queryStars = (username: string, limit: number, after?: string) => {
	return graphql<{ viewer: User }>(
		`
    query ($username: String!, $limit: Int!, $after: String) {
      user (login: $username) {
        starredRepositories(
          after: $after
          first: $limit
        ) {
          totalCount
          edges {
            cursor
            node {
              id
              nameWithOwner
              description
              isFork
              isArchived
              isLocked
              isDisabled
              isPrivate
              isMirror
            }
          }
        }
      }
    }
    `,
		{
			username,
			limit,
			after,
		},
	);
};

const filterEdge = <T>(edge: Maybe<T>): edge is T => edge != null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const queryAllStars = async (username: string) => {
	const LIMIT = 100;
	let after: string | undefined = undefined;
	const stars: Repository[] = [];
	while (true) {
		const { viewer } = await queryStars(username, LIMIT, after);
		const edges = viewer.starredRepositories.edges?.filter(filterEdge) ?? [];
		if (edges.length < LIMIT) {
			break;
		}
		after = edges.at(-1)?.cursor;
		if (after == null) {
			break;
		}
		stars.push(...edges.map((edge) => edge.node));
		sleep(500);
	}
	return stars;
};
