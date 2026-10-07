// Built-in sample lockfiles. The orchard, tiny-cli, npm and bun samples are hand-written; the two large ones are synthetic.
import { genLockText } from "./lockfile.js";

const SAMPLES = {};
SAMPLES.mature = `version = 1
revision = 2
requires-python = ">=3.12"

[[package]]
name = "orchard"
version = "0.4.1"
source = { editable = "." }
dependencies = [
    { name = "alembic" },
    { name = "email-validator" },
    { name = "fastapi" },
    { name = "httpx" },
    { name = "jinja2" },
    { name = "pandas" },
    { name = "pydantic" },
    { name = "python-multipart" },
    { name = "rich" },
    { name = "sqlalchemy" },
    { name = "typer" },
    { name = "uvicorn", extra = ["standard"] },
]

[package.dev-dependencies]
dev = [
    { name = "pytest" },
    { name = "pytest-asyncio" },
    { name = "ruff" },
]

[package.metadata]
requires-dist = [
    { name = "alembic", specifier = ">=1.13" },
    { name = "email-validator", specifier = ">=2.1" },
    { name = "fastapi", specifier = ">=0.111" },
    { name = "httpx", specifier = ">=0.27" },
    { name = "jinja2", specifier = ">=3.1" },
    { name = "pandas", specifier = ">=2.2" },
    { name = "pydantic", specifier = ">=2.7" },
    { name = "python-multipart", specifier = ">=0.0.9" },
    { name = "rich", specifier = ">=13.7" },
    { name = "sqlalchemy", specifier = ">=2.0" },
    { name = "typer", specifier = ">=0.12" },
    { name = "uvicorn", extras = ["standard"], specifier = ">=0.30" },
]

[package.metadata.requires-dev]
dev = [
    { name = "pytest", specifier = ">=8.2" },
    { name = "pytest-asyncio", specifier = ">=0.23" },
    { name = "ruff", specifier = ">=0.4" },
]

[[package]]
name = "alembic"
version = "1.13.1"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "mako" },
    { name = "sqlalchemy" },
    { name = "typing-extensions" },
]
sdist = { url = "https://files.pythonhosted.org/packages/alembic-1.13.1.tar.gz", hash = "sha256:9f1c3e1f0b1d6c7f4a0b2d3f4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a", size = 1213288 }
wheels = [
    { url = "https://files.pythonhosted.org/packages/alembic-1.13.1-py3-none-any.whl", hash = "sha256:2edcc97bed0bd3272611ce3a98d98279e9c209e7186e43e75bbb1b2bdfdbcc43", size = 233424 },
]

[[package]]
name = "annotated-types"
version = "0.7.0"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "anyio"
version = "4.4.0"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "idna" },
    { name = "sniffio" },
]

[[package]]
name = "certifi"
version = "2024.6.2"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "click"
version = "8.1.7"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "colorama", marker = "platform_system == 'Windows'" },
]

[[package]]
name = "colorama"
version = "0.4.6"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "dnspython"
version = "2.6.1"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "email-validator"
version = "2.1.1"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "dnspython" },
    { name = "idna" },
]

[[package]]
name = "fastapi"
version = "0.111.0"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "pydantic" },
    { name = "starlette" },
    { name = "typing-extensions" },
]

[[package]]
name = "greenlet"
version = "3.0.3"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "h11"
version = "0.14.0"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "httpcore"
version = "1.0.5"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "certifi" },
    { name = "h11" },
]

[[package]]
name = "httptools"
version = "0.6.1"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "httpx"
version = "0.27.0"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "anyio" },
    { name = "certifi" },
    { name = "httpcore" },
    { name = "idna" },
    { name = "sniffio" },
]

[[package]]
name = "idna"
version = "3.7"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "iniconfig"
version = "2.0.0"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "jinja2"
version = "3.1.4"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "markupsafe" },
]

[[package]]
name = "mako"
version = "1.3.5"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "markupsafe" },
]

[[package]]
name = "markdown-it-py"
version = "3.0.0"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "mdurl" },
]

[[package]]
name = "markupsafe"
version = "2.1.5"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "mdurl"
version = "0.1.2"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "numpy"
version = "1.26.4"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "packaging"
version = "24.1"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "pandas"
version = "2.2.2"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "numpy" },
    { name = "python-dateutil" },
    { name = "pytz" },
    { name = "tzdata" },
]

[[package]]
name = "pluggy"
version = "1.5.0"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "pydantic"
version = "2.7.4"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "annotated-types" },
    { name = "pydantic-core" },
    { name = "typing-extensions" },
]

[[package]]
name = "pydantic-core"
version = "2.18.4"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "typing-extensions" },
]

[[package]]
name = "pygments"
version = "2.18.0"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "pytest"
version = "8.2.2"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "colorama", marker = "sys_platform == 'win32'" },
    { name = "iniconfig" },
    { name = "packaging" },
    { name = "pluggy" },
]

[[package]]
name = "pytest-asyncio"
version = "0.23.7"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "pytest" },
]

[[package]]
name = "python-dateutil"
version = "2.9.0.post0"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "six" },
]

[[package]]
name = "python-dotenv"
version = "1.0.1"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "python-multipart"
version = "0.0.9"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "pytz"
version = "2024.1"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "pyyaml"
version = "6.0.1"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "rich"
version = "13.7.1"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "markdown-it-py" },
    { name = "pygments" },
]

[[package]]
name = "ruff"
version = "0.4.9"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "shellingham"
version = "1.5.4"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "six"
version = "1.16.0"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "sniffio"
version = "1.3.1"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "sqlalchemy"
version = "2.0.31"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "greenlet", marker = "platform_machine == 'aarch64' or platform_machine == 'x86_64'" },
    { name = "typing-extensions" },
]

[[package]]
name = "starlette"
version = "0.37.2"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "anyio" },
]

[[package]]
name = "typer"
version = "0.12.3"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "click" },
    { name = "rich" },
    { name = "shellingham" },
    { name = "typing-extensions" },
]

[[package]]
name = "typing-extensions"
version = "4.12.2"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "tzdata"
version = "2024.1"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "uvicorn"
version = "0.30.1"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "click" },
    { name = "h11" },
]

[package.optional-dependencies]
standard = [
    { name = "httptools" },
    { name = "python-dotenv" },
    { name = "pyyaml" },
    { name = "uvloop", marker = "platform_python_implementation != 'PyPy' and sys_platform != 'win32'" },
    { name = "watchfiles" },
    { name = "websockets" },
]

[[package]]
name = "uvloop"
version = "0.19.0"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "watchfiles"
version = "0.22.0"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "anyio" },
]

[[package]]
name = "websockets"
version = "12.0"
source = { registry = "https://pypi.org/simple" }
`;
SAMPLES.sapling = `version = 1
requires-python = ">=3.11"

[[package]]
name = "tiny-cli"
version = "0.1.0"
source = { virtual = "." }
dependencies = [
    { name = "click" },
    { name = "tomli-w" },
]

[[package]]
name = "click"
version = "8.1.7"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "colorama", marker = "platform_system == 'Windows'" },
]

[[package]]
name = "colorama"
version = "0.4.6"
source = { registry = "https://pypi.org/simple" }

[[package]]
name = "tomli-w"
version = "1.0.0"
source = { registry = "https://pypi.org/simple" }
`;
SAMPLES.npm = "{\n  \"name\": \"ledger-api\",\n  \"version\": \"1.2.0\",\n  \"lockfileVersion\": 3,\n  \"requires\": true,\n  \"packages\": {\n    \"\": {\n      \"name\": \"ledger-api\",\n      \"version\": \"1.2.0\",\n      \"dependencies\": {\n        \"express\": \"^4.19.2\"\n      },\n      \"devDependencies\": {\n        \"prettier\": \"^3.3.2\"\n      }\n    },\n    \"node_modules/express\": {\n      \"version\": \"4.19.2\",\n      \"resolved\": \"https://registry.npmjs.org/express/-/express-4.19.2.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"accepts\": \"^1.3.8\",\n        \"body-parser\": \"^1.20.2\",\n        \"debug\": \"^2.6.9\",\n        \"depd\": \"^2.0.0\",\n        \"encodeurl\": \"^1.0.2\",\n        \"escape-html\": \"^1.0.3\",\n        \"etag\": \"^1.8.1\",\n        \"fresh\": \"^0.5.2\",\n        \"http-errors\": \"^2.0.0\",\n        \"on-finished\": \"^2.4.1\",\n        \"qs\": \"^6.11.0\",\n        \"range-parser\": \"^1.2.1\",\n        \"send\": \"^0.18.0\",\n        \"statuses\": \"^2.0.1\",\n        \"type-is\": \"^1.6.18\"\n      }\n    },\n    \"node_modules/accepts\": {\n      \"version\": \"1.3.8\",\n      \"resolved\": \"https://registry.npmjs.org/accepts/-/accepts-1.3.8.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"mime-types\": \"^2.1.35\",\n        \"negotiator\": \"^0.6.3\"\n      }\n    },\n    \"node_modules/mime-types\": {\n      \"version\": \"2.1.35\",\n      \"resolved\": \"https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"mime-db\": \"^1.52.0\"\n      }\n    },\n    \"node_modules/mime-db\": {\n      \"version\": \"1.52.0\",\n      \"resolved\": \"https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/negotiator\": {\n      \"version\": \"0.6.3\",\n      \"resolved\": \"https://registry.npmjs.org/negotiator/-/negotiator-0.6.3.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/body-parser\": {\n      \"version\": \"1.20.2\",\n      \"resolved\": \"https://registry.npmjs.org/body-parser/-/body-parser-1.20.2.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"bytes\": \"^3.1.2\",\n        \"content-type\": \"^1.0.5\",\n        \"debug\": \"^2.6.9\",\n        \"depd\": \"^2.0.0\",\n        \"destroy\": \"^1.2.0\",\n        \"http-errors\": \"^2.0.0\",\n        \"iconv-lite\": \"^0.4.24\",\n        \"on-finished\": \"^2.4.1\",\n        \"qs\": \"^6.11.0\",\n        \"raw-body\": \"^2.5.2\",\n        \"type-is\": \"^1.6.18\",\n        \"unpipe\": \"^1.0.0\"\n      }\n    },\n    \"node_modules/bytes\": {\n      \"version\": \"3.1.2\",\n      \"resolved\": \"https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/content-type\": {\n      \"version\": \"1.0.5\",\n      \"resolved\": \"https://registry.npmjs.org/content-type/-/content-type-1.0.5.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/debug\": {\n      \"version\": \"2.6.9\",\n      \"resolved\": \"https://registry.npmjs.org/debug/-/debug-2.6.9.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"ms\": \"^2.0.0\"\n      }\n    },\n    \"node_modules/ms\": {\n      \"version\": \"2.0.0\",\n      \"resolved\": \"https://registry.npmjs.org/ms/-/ms-2.0.0.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/depd\": {\n      \"version\": \"2.0.0\",\n      \"resolved\": \"https://registry.npmjs.org/depd/-/depd-2.0.0.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/destroy\": {\n      \"version\": \"1.2.0\",\n      \"resolved\": \"https://registry.npmjs.org/destroy/-/destroy-1.2.0.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/http-errors\": {\n      \"version\": \"2.0.0\",\n      \"resolved\": \"https://registry.npmjs.org/http-errors/-/http-errors-2.0.0.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"depd\": \"^2.0.0\",\n        \"inherits\": \"^2.0.4\",\n        \"setprototypeof\": \"^1.2.0\",\n        \"statuses\": \"^2.0.1\",\n        \"toidentifier\": \"^1.0.1\"\n      }\n    },\n    \"node_modules/inherits\": {\n      \"version\": \"2.0.4\",\n      \"resolved\": \"https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/setprototypeof\": {\n      \"version\": \"1.2.0\",\n      \"resolved\": \"https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/statuses\": {\n      \"version\": \"2.0.1\",\n      \"resolved\": \"https://registry.npmjs.org/statuses/-/statuses-2.0.1.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/toidentifier\": {\n      \"version\": \"1.0.1\",\n      \"resolved\": \"https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/iconv-lite\": {\n      \"version\": \"0.4.24\",\n      \"resolved\": \"https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.4.24.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"safer-buffer\": \"^2.1.2\"\n      }\n    },\n    \"node_modules/safer-buffer\": {\n      \"version\": \"2.1.2\",\n      \"resolved\": \"https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/on-finished\": {\n      \"version\": \"2.4.1\",\n      \"resolved\": \"https://registry.npmjs.org/on-finished/-/on-finished-2.4.1.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"ee-first\": \"^1.1.1\"\n      }\n    },\n    \"node_modules/ee-first\": {\n      \"version\": \"1.1.1\",\n      \"resolved\": \"https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/qs\": {\n      \"version\": \"6.11.0\",\n      \"resolved\": \"https://registry.npmjs.org/qs/-/qs-6.11.0.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"side-channel\": \"^1.0.6\"\n      }\n    },\n    \"node_modules/side-channel\": {\n      \"version\": \"1.0.6\",\n      \"resolved\": \"https://registry.npmjs.org/side-channel/-/side-channel-1.0.6.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"object-inspect\": \"^1.13.1\"\n      }\n    },\n    \"node_modules/object-inspect\": {\n      \"version\": \"1.13.1\",\n      \"resolved\": \"https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.1.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/raw-body\": {\n      \"version\": \"2.5.2\",\n      \"resolved\": \"https://registry.npmjs.org/raw-body/-/raw-body-2.5.2.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"bytes\": \"^3.1.2\",\n        \"http-errors\": \"^2.0.0\",\n        \"iconv-lite\": \"^0.4.24\",\n        \"unpipe\": \"^1.0.0\"\n      }\n    },\n    \"node_modules/unpipe\": {\n      \"version\": \"1.0.0\",\n      \"resolved\": \"https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/type-is\": {\n      \"version\": \"1.6.18\",\n      \"resolved\": \"https://registry.npmjs.org/type-is/-/type-is-1.6.18.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"media-typer\": \"^0.3.0\",\n        \"mime-types\": \"^2.1.35\"\n      }\n    },\n    \"node_modules/media-typer\": {\n      \"version\": \"0.3.0\",\n      \"resolved\": \"https://registry.npmjs.org/media-typer/-/media-typer-0.3.0.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/send\": {\n      \"version\": \"0.18.0\",\n      \"resolved\": \"https://registry.npmjs.org/send/-/send-0.18.0.tgz\",\n      \"license\": \"MIT\",\n      \"dependencies\": {\n        \"debug\": \"^2.6.9\",\n        \"depd\": \"^2.0.0\",\n        \"destroy\": \"^1.2.0\",\n        \"encodeurl\": \"^1.0.2\",\n        \"escape-html\": \"^1.0.3\",\n        \"etag\": \"^1.8.1\",\n        \"fresh\": \"^0.5.2\",\n        \"http-errors\": \"^2.0.0\",\n        \"mime\": \"^1.6.0\",\n        \"ms\": \"^2.0.0\",\n        \"on-finished\": \"^2.4.1\",\n        \"range-parser\": \"^1.2.1\",\n        \"statuses\": \"^2.0.1\"\n      }\n    },\n    \"node_modules/encodeurl\": {\n      \"version\": \"1.0.2\",\n      \"resolved\": \"https://registry.npmjs.org/encodeurl/-/encodeurl-1.0.2.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/escape-html\": {\n      \"version\": \"1.0.3\",\n      \"resolved\": \"https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/etag\": {\n      \"version\": \"1.8.1\",\n      \"resolved\": \"https://registry.npmjs.org/etag/-/etag-1.8.1.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/fresh\": {\n      \"version\": \"0.5.2\",\n      \"resolved\": \"https://registry.npmjs.org/fresh/-/fresh-0.5.2.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/mime\": {\n      \"version\": \"1.6.0\",\n      \"resolved\": \"https://registry.npmjs.org/mime/-/mime-1.6.0.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/range-parser\": {\n      \"version\": \"1.2.1\",\n      \"resolved\": \"https://registry.npmjs.org/range-parser/-/range-parser-1.2.1.tgz\",\n      \"license\": \"MIT\"\n    },\n    \"node_modules/prettier\": {\n      \"version\": \"3.3.2\",\n      \"resolved\": \"https://registry.npmjs.org/prettier/-/prettier-3.3.2.tgz\",\n      \"license\": \"MIT\",\n      \"dev\": true,\n      \"bin\": {\n        \"prettier\": \"bin/prettier.cjs\"\n      }\n    }\n  }\n}";
SAMPLES.bun = "{\n  \"lockfileVersion\": 1,\n  \"workspaces\": {\n    \"\": {\n      \"name\": \"ledger-api\",\n      \"dependencies\": {\n        \"express\": \"^4.19.2\",\n      },\n      \"devDependencies\": {\n        \"prettier\": \"^3.3.2\",\n      },\n    },\n  },\n  \"packages\": {\n    \"express\": [\"express@4.19.2\", \"\", { \"dependencies\": { \"accepts\": \"^1.3.8\", \"body-parser\": \"^1.20.2\", \"debug\": \"^2.6.9\", \"depd\": \"^2.0.0\", \"encodeurl\": \"^1.0.2\", \"escape-html\": \"^1.0.3\", \"etag\": \"^1.8.1\", \"fresh\": \"^0.5.2\", \"http-errors\": \"^2.0.0\", \"on-finished\": \"^2.4.1\", \"qs\": \"^6.11.0\", \"range-parser\": \"^1.2.1\", \"send\": \"^0.18.0\", \"statuses\": \"^2.0.1\", \"type-is\": \"^1.6.18\" } }, \"sha512-ZXhwcmVzczQuMTkuMg==\"],\n\n    \"accepts\": [\"accepts@1.3.8\", \"\", { \"dependencies\": { \"mime-types\": \"^2.1.35\", \"negotiator\": \"^0.6.3\" } }, \"sha512-YWNjZXB0czEuMy44\"],\n\n    \"mime-types\": [\"mime-types@2.1.35\", \"\", { \"dependencies\": { \"mime-db\": \"^1.52.0\" } }, \"sha512-bWltZS10eXBlczIuMS4zNQ==\"],\n\n    \"mime-db\": [\"mime-db@1.52.0\", \"\", {}, \"sha512-bWltZS1kYjEuNTIuMA==\"],\n\n    \"negotiator\": [\"negotiator@0.6.3\", \"\", {}, \"sha512-bmVnb3RpYXRvcjAuNi4z\"],\n\n    \"body-parser\": [\"body-parser@1.20.2\", \"\", { \"dependencies\": { \"bytes\": \"^3.1.2\", \"content-type\": \"^1.0.5\", \"debug\": \"^2.6.9\", \"depd\": \"^2.0.0\", \"destroy\": \"^1.2.0\", \"http-errors\": \"^2.0.0\", \"iconv-lite\": \"^0.4.24\", \"on-finished\": \"^2.4.1\", \"qs\": \"^6.11.0\", \"raw-body\": \"^2.5.2\", \"type-is\": \"^1.6.18\", \"unpipe\": \"^1.0.0\" } }, \"sha512-Ym9keS1wYXJzZXIxLjIwLjI=\"],\n\n    \"bytes\": [\"bytes@3.1.2\", \"\", {}, \"sha512-Ynl0ZXMzLjEuMg==\"],\n\n    \"content-type\": [\"content-type@1.0.5\", \"\", {}, \"sha512-Y29udGVudC10eXBlMS4wLjU=\"],\n\n    \"debug\": [\"debug@2.6.9\", \"\", { \"dependencies\": { \"ms\": \"^2.0.0\" } }, \"sha512-ZGVidWcyLjYuOQ==\"],\n\n    \"ms\": [\"ms@2.0.0\", \"\", {}, \"sha512-bXMyLjAuMA==\"],\n\n    \"depd\": [\"depd@2.0.0\", \"\", {}, \"sha512-ZGVwZDIuMC4w\"],\n\n    \"destroy\": [\"destroy@1.2.0\", \"\", {}, \"sha512-ZGVzdHJveTEuMi4w\"],\n\n    \"http-errors\": [\"http-errors@2.0.0\", \"\", { \"dependencies\": { \"depd\": \"^2.0.0\", \"inherits\": \"^2.0.4\", \"setprototypeof\": \"^1.2.0\", \"statuses\": \"^2.0.1\", \"toidentifier\": \"^1.0.1\" } }, \"sha512-aHR0cC1lcnJvcnMyLjAuMA==\"],\n\n    \"inherits\": [\"inherits@2.0.4\", \"\", {}, \"sha512-aW5oZXJpdHMyLjAuNA==\"],\n\n    \"setprototypeof\": [\"setprototypeof@1.2.0\", \"\", {}, \"sha512-c2V0cHJvdG90eXBlb2YxLjIu\"],\n\n    \"statuses\": [\"statuses@2.0.1\", \"\", {}, \"sha512-c3RhdHVzZXMyLjAuMQ==\"],\n\n    \"toidentifier\": [\"toidentifier@1.0.1\", \"\", {}, \"sha512-dG9pZGVudGlmaWVyMS4wLjE=\"],\n\n    \"iconv-lite\": [\"iconv-lite@0.4.24\", \"\", { \"dependencies\": { \"safer-buffer\": \"^2.1.2\" } }, \"sha512-aWNvbnYtbGl0ZTAuNC4yNA==\"],\n\n    \"safer-buffer\": [\"safer-buffer@2.1.2\", \"\", {}, \"sha512-c2FmZXItYnVmZmVyMi4xLjI=\"],\n\n    \"on-finished\": [\"on-finished@2.4.1\", \"\", { \"dependencies\": { \"ee-first\": \"^1.1.1\" } }, \"sha512-b24tZmluaXNoZWQyLjQuMQ==\"],\n\n    \"ee-first\": [\"ee-first@1.1.1\", \"\", {}, \"sha512-ZWUtZmlyc3QxLjEuMQ==\"],\n\n    \"qs\": [\"qs@6.11.0\", \"\", { \"dependencies\": { \"side-channel\": \"^1.0.6\" } }, \"sha512-cXM2LjExLjA=\"],\n\n    \"side-channel\": [\"side-channel@1.0.6\", \"\", { \"dependencies\": { \"object-inspect\": \"^1.13.1\" } }, \"sha512-c2lkZS1jaGFubmVsMS4wLjY=\"],\n\n    \"object-inspect\": [\"object-inspect@1.13.1\", \"\", {}, \"sha512-b2JqZWN0LWluc3BlY3QxLjEz\"],\n\n    \"raw-body\": [\"raw-body@2.5.2\", \"\", { \"dependencies\": { \"bytes\": \"^3.1.2\", \"http-errors\": \"^2.0.0\", \"iconv-lite\": \"^0.4.24\", \"unpipe\": \"^1.0.0\" } }, \"sha512-cmF3LWJvZHkyLjUuMg==\"],\n\n    \"unpipe\": [\"unpipe@1.0.0\", \"\", {}, \"sha512-dW5waXBlMS4wLjA=\"],\n\n    \"type-is\": [\"type-is@1.6.18\", \"\", { \"dependencies\": { \"media-typer\": \"^0.3.0\", \"mime-types\": \"^2.1.35\" } }, \"sha512-dHlwZS1pczEuNi4xOA==\"],\n\n    \"media-typer\": [\"media-typer@0.3.0\", \"\", {}, \"sha512-bWVkaWEtdHlwZXIwLjMuMA==\"],\n\n    \"send\": [\"send@0.18.0\", \"\", { \"dependencies\": { \"debug\": \"^2.6.9\", \"depd\": \"^2.0.0\", \"destroy\": \"^1.2.0\", \"encodeurl\": \"^1.0.2\", \"escape-html\": \"^1.0.3\", \"etag\": \"^1.8.1\", \"fresh\": \"^0.5.2\", \"http-errors\": \"^2.0.0\", \"mime\": \"^1.6.0\", \"ms\": \"^2.0.0\", \"on-finished\": \"^2.4.1\", \"range-parser\": \"^1.2.1\", \"statuses\": \"^2.0.1\" } }, \"sha512-c2VuZDAuMTguMA==\"],\n\n    \"encodeurl\": [\"encodeurl@1.0.2\", \"\", {}, \"sha512-ZW5jb2RldXJsMS4wLjI=\"],\n\n    \"escape-html\": [\"escape-html@1.0.3\", \"\", {}, \"sha512-ZXNjYXBlLWh0bWwxLjAuMw==\"],\n\n    \"etag\": [\"etag@1.8.1\", \"\", {}, \"sha512-ZXRhZzEuOC4x\"],\n\n    \"fresh\": [\"fresh@0.5.2\", \"\", {}, \"sha512-ZnJlc2gwLjUuMg==\"],\n\n    \"mime\": [\"mime@1.6.0\", \"\", {}, \"sha512-bWltZTEuNi4w\"],\n\n    \"range-parser\": [\"range-parser@1.2.1\", \"\", {}, \"sha512-cmFuZ2UtcGFyc2VyMS4yLjE=\"],\n\n    \"prettier\": [\"prettier@3.3.2\", \"\", {}, \"sha512-cHJldHRpZXIzLjMuMg==\"],\n\n  }\n}\n";
SAMPLES.old = genLockText(160, 7);
SAMPLES.ancient = genLockText(420, 42);

// Small fixtures for the other formats (also in ../samples/).
SAMPLES.cargo = "# This file is automatically @generated by Cargo.\n# It is not intended for manual editing.\nversion = 3\n\n[[package]]\nname = \"aho-corasick\"\nversion = \"1.1.3\"\nsource = \"registry+https://github.com/rust-lang/crates.io-index\"\nchecksum = \"8e60d3430d3a69478ad0993f19238d2df97c507009a52b3c10addcd7f6bcb916\"\ndependencies = [\n \"memchr\",\n]\n\n[[package]]\nname = \"memchr\"\nversion = \"2.7.2\"\nsource = \"registry+https://github.com/rust-lang/crates.io-index\"\nchecksum = \"6c8640c5d730cb13ebd907d8d04b52f55ac9a2eec55b440c8892f40d56c76c1d\"\n\n[[package]]\nname = \"regex\"\nversion = \"1.10.4\"\nsource = \"registry+https://github.com/rust-lang/crates.io-index\"\nchecksum = \"c117dbdfde9c8308e4d15cd73e3a0ec3f4e8d8d0ca0c47eaa5d3b8f0e5f9dcd1\"\ndependencies = [\n \"aho-corasick\",\n \"memchr\",\n \"regex-automata\",\n \"regex-syntax\",\n]\n\n[[package]]\nname = \"regex-automata\"\nversion = \"0.4.6\"\nsource = \"registry+https://github.com/rust-lang/crates.io-index\"\nchecksum = \"86b83b8b9847f9bf95ef68afb0b8e6cdb80f498442f5179a29fad448fcc1eaea\"\ndependencies = [\n \"aho-corasick\",\n \"memchr\",\n \"regex-syntax\",\n]\n\n[[package]]\nname = \"regex-syntax\"\nversion = \"0.8.3\"\nsource = \"registry+https://github.com/rust-lang/crates.io-index\"\nchecksum = \"adad44e29e4c806119491a7f06f03de4d1af22c3a680dd47f1e6e179439d1f56\"\n\n[[package]]\nname = \"serde\"\nversion = \"1.0.197\"\nsource = \"registry+https://github.com/rust-lang/crates.io-index\"\nchecksum = \"3fb1c873e1b9b056a4dc4c0c198b24c3ffa059243875552b2bd0933b1aee4ce2\"\ndependencies = [\n \"serde_derive\",\n]\n\n[[package]]\nname = \"serde_derive\"\nversion = \"1.0.197\"\nsource = \"registry+https://github.com/rust-lang/crates.io-index\"\nchecksum = \"7eb0b34b42edc17f6b7cac84a52a1c5f0e1bb2227e997ca9011ea3dd34e8e3bb\"\ndependencies = [\n \"syn\",\n]\n\n[[package]]\nname = \"syn\"\nversion = \"2.0.58\"\nsource = \"registry+https://github.com/rust-lang/crates.io-index\"\nchecksum = \"44cfb93f38070beee36b3fef7d4f5a16f27751d94b187b666a5cc5e9b0d30687\"\n\n[[package]]\nname = \"treecrawl\"\nversion = \"0.3.0\"\ndependencies = [\n \"regex\",\n \"serde\",\n]\n";
SAMPLES.gemfile = "GEM\n  remote: https://rubygems.org/\n  specs:\n    concurrent-ruby (1.2.3)\n    i18n (1.14.4)\n      concurrent-ruby (~> 1.0)\n    minitest (5.22.3)\n    rack (3.0.10)\n    rack-test (2.1.0)\n      rack (>= 1.3)\n    sinatra (4.0.0)\n      mustermann (~> 3.0)\n      rack (>= 3.0.0, < 4)\n      rack-protection (= 4.0.0)\n      tilt (~> 2.0)\n    mustermann (3.0.0)\n      ruby2_keywords (~> 0.0.1)\n    rack-protection (4.0.0)\n      base64 (>= 0.1.0)\n      rack (>= 3.0.0, < 4)\n    base64 (0.2.0)\n    ruby2_keywords (0.0.5)\n    tilt (2.3.0)\n\nPLATFORMS\n  arm64-darwin-23\n  ruby\n\nDEPENDENCIES\n  i18n\n  minitest\n  rack-test\n  sinatra (~> 4.0)\n\nBUNDLED WITH\n   2.5.9\n";
SAMPLES.composer = "{\n    \"_readme\": [\"This file locks the dependencies of your project to a known state\"],\n    \"content-hash\": \"abc\",\n    \"packages\": [\n        { \"name\": \"guzzlehttp/guzzle\", \"version\": \"7.8.1\", \"require\": { \"php\": \"^7.2.5 || ^8.0\", \"ext-json\": \"*\", \"guzzlehttp/promises\": \"^1.5.3 || ^2.0.1\", \"guzzlehttp/psr7\": \"^1.9.1 || ^2.5.1\", \"psr/http-client\": \"^1.0\", \"symfony/deprecation-contracts\": \"^2.2 || ^3.0\" } },\n        { \"name\": \"guzzlehttp/promises\", \"version\": \"2.0.2\", \"require\": { \"php\": \"^7.2.5 || ^8.0\" } },\n        { \"name\": \"guzzlehttp/psr7\", \"version\": \"2.6.2\", \"require\": { \"php\": \"^7.2.5 || ^8.0\", \"psr/http-factory\": \"^1.0\", \"psr/http-message\": \"^1.1 || ^2.0\", \"ralouphie/getallheaders\": \"^3.0\" } },\n        { \"name\": \"psr/http-client\", \"version\": \"1.0.3\", \"require\": { \"php\": \"^7.0 || ^8.0\", \"psr/http-message\": \"^1.0 || ^2.0\" } },\n        { \"name\": \"psr/http-factory\", \"version\": \"1.0.2\", \"require\": { \"php\": \">=7.0.0\", \"psr/http-message\": \"^1.0 || ^2.0\" } },\n        { \"name\": \"psr/http-message\", \"version\": \"2.0\", \"require\": { \"php\": \"^7.2 || ^8.0\" } },\n        { \"name\": \"ralouphie/getallheaders\", \"version\": \"3.0.3\", \"require\": { \"php\": \">=5.6\" } },\n        { \"name\": \"symfony/deprecation-contracts\", \"version\": \"3.4.0\", \"require\": { \"php\": \">=8.1\" } }\n    ],\n    \"packages-dev\": [\n        { \"name\": \"phpunit/phpunit\", \"version\": \"10.5.17\", \"require\": { \"php\": \">=8.1\", \"sebastian/diff\": \"^5.0\" } },\n        { \"name\": \"sebastian/diff\", \"version\": \"5.1.1\", \"require\": { \"php\": \">=8.1\" } }\n    ],\n    \"minimum-stability\": \"stable\",\n    \"plugin-api-version\": \"2.6.0\"\n}\n";
SAMPLES.poetry = "# This file is automatically @generated by Poetry 1.8.2 and should not be changed by hand.\n\n[[package]]\nname = \"certifi\"\nversion = \"2024.2.2\"\ndescription = \"Python package for providing Mozilla's CA Bundle.\"\noptional = false\npython-versions = \">=3.6\"\nfiles = [\n    {file = \"certifi-2024.2.2-py3-none-any.whl\", hash = \"sha256:abc\"},\n]\n\n[[package]]\nname = \"charset-normalizer\"\nversion = \"3.3.2\"\ndescription = \"The Real First Universal Charset Detector.\"\noptional = false\npython-versions = \">=3.7.0\"\nfiles = []\n\n[[package]]\nname = \"idna\"\nversion = \"3.7\"\ndescription = \"Internationalized Domain Names in Applications (IDNA)\"\noptional = false\npython-versions = \">=3.5\"\nfiles = []\n\n[[package]]\nname = \"requests\"\nversion = \"2.31.0\"\ndescription = \"Python HTTP for Humans.\"\noptional = false\npython-versions = \">=3.7\"\nfiles = []\n\n[package.dependencies]\ncertifi = \">=2017.4.17\"\ncharset-normalizer = \">=2,<4\"\nidna = \">=2.5,<4\"\nurllib3 = \">=1.21.1,<3\"\nPySocks = {version = \">=1.5.6,<1.5.7 || >1.5.7\", optional = true}\n\n[package.extras]\nsocks = [\"PySocks (>=1.5.6,!=1.5.7)\"]\n\n[[package]]\nname = \"urllib3\"\nversion = \"2.2.1\"\ndescription = \"HTTP library with thread-safe connection pooling, file post, and more.\"\noptional = false\npython-versions = \">=3.8\"\nfiles = []\n\n[[package]]\nname = \"pytest\"\nversion = \"8.1.1\"\ndescription = \"pytest: simple powerful testing with Python\"\noptional = false\npython-versions = \">=3.8\"\ngroups = [\"dev\"]\nfiles = []\n\n[package.dependencies]\niniconfig = \"*\"\npluggy = \">=1.4,<2.0\"\n\n[[package]]\nname = \"iniconfig\"\nversion = \"2.0.0\"\ndescription = \"brain-dead simple config-ini parsing\"\noptional = false\npython-versions = \">=3.7\"\ngroups = [\"dev\"]\nfiles = []\n\n[[package]]\nname = \"pluggy\"\nversion = \"1.4.0\"\ndescription = \"plugin and hook calling mechanisms for python\"\noptional = false\npython-versions = \">=3.8\"\ngroups = [\"dev\"]\nfiles = []\n\n[metadata]\nlock-version = \"2.0\"\npython-versions = \"^3.11\"\ncontent-hash = \"abc\"\n";
SAMPLES.pipfile = "{\n    \"_meta\": {\n        \"hash\": { \"sha256\": \"abc\" },\n        \"pipfile-spec\": 6,\n        \"requires\": { \"python_version\": \"3.12\" },\n        \"sources\": [ { \"name\": \"pypi\", \"url\": \"https://pypi.org/simple\", \"verify_ssl\": true } ]\n    },\n    \"default\": {\n        \"flask\": { \"hashes\": [\"sha256:1\"], \"index\": \"pypi\", \"version\": \"==3.0.3\" },\n        \"requests\": { \"hashes\": [\"sha256:2\"], \"index\": \"pypi\", \"version\": \"==2.31.0\" },\n        \"werkzeug\": { \"hashes\": [\"sha256:3\"], \"version\": \"==3.0.2\" }\n    },\n    \"develop\": {\n        \"black\": { \"hashes\": [\"sha256:4\"], \"index\": \"pypi\", \"version\": \"==24.4.0\" }\n    }\n}\n";
SAMPLES.pnpm = "lockfileVersion: '9.0'\n\nsettings:\n  autoInstallPeers: true\n  excludeLinksFromLockfile: false\n\nimporters:\n\n  .:\n    dependencies:\n      debug:\n        specifier: ^4.3.4\n        version: 4.3.4\n      ms:\n        specifier: ^2.1.3\n        version: 2.1.3\n    devDependencies:\n      typescript:\n        specifier: ^5.4.5\n        version: 5.4.5\n\npackages:\n\n  debug@4.3.4:\n    resolution: {integrity: sha512-abc}\n    engines: {node: '>=6.0'}\n    peerDependencies:\n      supports-color: '*'\n    peerDependenciesMeta:\n      supports-color:\n        optional: true\n\n  ms@2.1.2:\n    resolution: {integrity: sha512-def}\n\n  ms@2.1.3:\n    resolution: {integrity: sha512-ghi}\n\n  typescript@5.4.5:\n    resolution: {integrity: sha512-jkl}\n    engines: {node: '>=14.17'}\n    hasBin: true\n\nsnapshots:\n\n  debug@4.3.4:\n    dependencies:\n      ms: 2.1.2\n\n  ms@2.1.2: {}\n\n  ms@2.1.3: {}\n\n  typescript@5.4.5: {}\n";
SAMPLES.yarn1 = "# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.\n# yarn lockfile v1\n\n\n\"@babel/code-frame@^7.0.0\":\n  version \"7.24.2\"\n  resolved \"https://registry.yarnpkg.com/@babel/code-frame/-/code-frame-7.24.2.tgz#718b4994415c8c3a1aad6ddb9a1b2a8b8b2d1c8b\"\n  integrity sha512-abc\n  dependencies:\n    \"@babel/highlight\" \"^7.24.2\"\n    picocolors \"^1.0.0\"\n\n\"@babel/highlight@^7.24.2\":\n  version \"7.24.2\"\n  resolved \"https://registry.yarnpkg.com/@babel/highlight/-/highlight-7.24.2.tgz\"\n  integrity sha512-def\n  dependencies:\n    chalk \"^2.4.2\"\n\nchalk@^2.4.2:\n  version \"2.4.2\"\n  resolved \"https://registry.yarnpkg.com/chalk/-/chalk-2.4.2.tgz\"\n  integrity sha512-ghi\n  dependencies:\n    ansi-styles \"^3.2.1\"\n    supports-color \"^5.3.0\"\n\nansi-styles@^3.2.1:\n  version \"3.2.1\"\n  resolved \"https://registry.yarnpkg.com/ansi-styles/-/ansi-styles-3.2.1.tgz\"\n  integrity sha512-jkl\n\nsupports-color@^5.3.0:\n  version \"5.5.0\"\n  resolved \"https://registry.yarnpkg.com/supports-color/-/supports-color-5.5.0.tgz\"\n  integrity sha512-mno\n  dependencies:\n    has-flag \"^3.0.0\"\n\nhas-flag@^3.0.0:\n  version \"3.0.0\"\n  resolved \"https://registry.yarnpkg.com/has-flag/-/has-flag-3.0.0.tgz\"\n  integrity sha512-pqr\n\npicocolors@^1.0.0:\n  version \"1.0.1\"\n  resolved \"https://registry.yarnpkg.com/picocolors/-/picocolors-1.0.1.tgz\"\n  integrity sha512-stu\n\nlodash@^4.17.21:\n  version \"4.17.21\"\n  resolved \"https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz\"\n  integrity sha512-vwx\n";
SAMPLES.yarn2 = "# This file is generated by running \"yarn install\" inside your project.\n# Manual changes might be lost - proceed with caution!\n\n__metadata:\n  version: 8\n  cacheKey: 10c0\n\n\"ansi-regex@npm:^5.0.1\":\n  version: 5.0.1\n  resolution: \"ansi-regex@npm:5.0.1\"\n  checksum: 10c0/abc\n  languageName: node\n  linkType: hard\n\n\"my-app@workspace:.\":\n  version: 0.0.0-use.local\n  resolution: \"my-app@workspace:.\"\n  dependencies:\n    strip-ansi: \"npm:^6.0.1\"\n    tiny-invariant: \"npm:^1.3.3\"\n  languageName: unknown\n  linkType: soft\n\n\"strip-ansi@npm:^6.0.1\":\n  version: 6.0.1\n  resolution: \"strip-ansi@npm:6.0.1\"\n  dependencies:\n    ansi-regex: \"npm:^5.0.1\"\n  checksum: 10c0/def\n  languageName: node\n  linkType: hard\n\n\"tiny-invariant@npm:^1.3.3\":\n  version: 1.3.3\n  resolution: \"tiny-invariant@npm:1.3.3\"\n  checksum: 10c0/ghi\n  languageName: node\n  linkType: hard\n";

export { SAMPLES };
