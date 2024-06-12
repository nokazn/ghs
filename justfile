format:
  treefmt --fail-on-change

format-fix:
  treefmt

check:
  biome check ./packages

check-fix:
  biome check ./packages --apply
