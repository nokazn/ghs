format:
  treefmt --fail-on-changes

format-fix:
  treefmt

check:
  biome check ./packages

check-fix:
  biome check ./packages --apply
