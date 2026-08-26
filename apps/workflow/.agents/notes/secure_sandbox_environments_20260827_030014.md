# Research Notes: Secure Sandbox Environments

## Findings
- **Process-level isolation (`vm2`)**: Avoid. History of critical sandbox escape CVEs.
- **V8 Isolates (`isolated-vm`)**: Strong isolation. Runs JS in separate isolates. No host access unless explicitly bridged. High security, but requires native bindings.
- **Containerization (Docker/gVisor)**: Gold standard for file system I/O. gVisor provides an extra layer of kernel isolation.
- **Specialized Tools**: `secure-exec` and `enclave-vm` are emerging alternatives for LLM-driven code execution.

## Sources
- isolated-vm GitHub
- vm2 Security Analysis
- secure-exec.dev

