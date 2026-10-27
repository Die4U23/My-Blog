"""Verify the deployed HTML cache policy, including conditional requests.

Usage: python scripts/check-html-cache.py https://mengsblog.top
"""

import concurrent.futures
from pathlib import Path
import sys
from urllib.error import HTTPError
from urllib.request import Request, urlopen


def request(url, headers=None):
    try:
        response = urlopen(Request(url, headers=headers or {}), timeout=15)
    except HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read()


def check_policy(headers):
    directives = {
        item.strip().lower()
        for value in headers.get_all("Cache-Control", [])
        for item in value.split(",")
    }
    assert {"no-cache", "must-revalidate"} <= directives, (
        f"Cache-Control: {headers.get_all('Cache-Control')}"
    )
    assert "immutable" not in directives, "HTML must not be immutable"


def check_page(base, path):
    try:
        url = base + path
        status, headers, body = request(url)
        assert status == 200, f"initial status {status}"
        assert "text/html" in headers.get("Content-Type", ""), "not HTML"
        check_policy(headers)
        etag = headers.get("ETag")
        modified = headers.get("Last-Modified")
        assert etag and modified, "missing HTML validators"
        for validator in [{"If-None-Match": etag}, {"If-Modified-Since": modified}]:
            status, cached_headers, cached_body = request(url, validator)
            assert status == 304 and not cached_body, f"conditional status {status}"
            check_policy(cached_headers)
        status, fresh_headers, fresh_body = request(
            url, {"If-None-Match": '"unmatched-cache-check-validator"'}
        )
        assert status == 200 and fresh_body == body, f"stale validator status {status}"
        check_policy(fresh_headers)
        return path, None
    except Exception as error:
        return path, str(error)


def main():
    base = (sys.argv[1] if len(sys.argv) > 1 else "https://mengsblog.top").rstrip("/")
    root = Path(__file__).resolve().parents[1]
    paths = [
        "/" if path.parent == root else "/" + path.parent.relative_to(root).as_posix() + "/"
        for path in sorted(root.rglob("index.html"))
        if ".git" not in path.parts
    ]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda path: check_page(base, path), paths))
    for path, error in results:
        print(f"{'FAIL' if error else 'PASS'} {path}" + (f": {error}" if error else ""))
    failed = sum(error is not None for _, error in results)
    print(f"{len(results) - failed}/{len(results)} pages passed at {base}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
