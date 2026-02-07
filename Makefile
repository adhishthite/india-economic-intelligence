.PHONY: install format lint check test clean dev build

install:
	bun install

format:
	bunx @biomejs/biome format --write .

lint:
	bunx @biomejs/biome lint --write .

check:
	bunx @biomejs/biome check --write .

test:
	bun test

clean:
	rm -rf .next node_modules

dev:
	bun run dev

build:
	bun run build
