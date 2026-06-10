import { useState, useEffect, useRef } from 'react';
import {
  Compass, Terminal, Layers, ArrowRight, Boxes, GitBranch, Activity,
  Package, Wrench, BookOpen, Check, ChevronRight, ChevronLeft,
  Copy, X, Search, RotateCcw, Play, ArrowLeft, Quote, MousePointerClick,
  Loader2, Library, AlertTriangle, FolderTree, Lock, Zap, Network,
  XCircle, Cpu, Settings
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   LINUX ATLAS · DATA
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "Linus 1991, the kernel, distros, and the 2026 Linux landscape." },
  { id: 'shell', label: 'Shell', icon: Terminal, num: '02', sub: "Bash, pipes, redirection, expansion. The lingua franca of Unix." },
  { id: 'fs', label: 'Filesystem', icon: FolderTree, num: '03', sub: "The FHS, paths, links, /proc, /sys. Everything is a file." },
  { id: 'proc', label: 'Processes', icon: Activity, num: '04', sub: "PIDs, fork/exec, signals, scheduling, cgroups." },
  { id: 'perms', label: 'Permissions', icon: Lock, num: '05', sub: "chmod, chown, the rwx model, ACLs, capabilities, sudo." },
  { id: 'net', label: 'Networking', icon: Network, num: '06', sub: "ip, ss, tcpdump, nftables. Linux as a network appliance." },
  { id: 'systemd', label: 'systemd', icon: Settings, num: '07', sub: "Units, services, timers, journalctl, the boot sequence." },
  { id: 'pkg', label: 'Packages', icon: Package, num: '08', sub: "apt, dnf, pacman, snap, flatpak. How Linux installs software." },
  { id: 'library', label: 'Library', icon: Library, num: '09', sub: "Curated recipes — shell, systemd, networking, performance, debugging." },
  { id: 'sandbox', label: 'Sandbox', icon: Play, num: '10', sub: "A real mini-shell in your browser. Virtual filesystem, 8 challenges." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '11', sub: "Out of disk, OOM kill, service won't start, slow boot, permission denied." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '12', sub: "Books, man pages worth reading, the Linux roadmap." },
];

const STACKS = [
  { id: 'server', label: 'Backend / server ops', desc: 'Running services on Linux servers — your VPSes, Coolify hosts', icon: '◉' },
  { id: 'containers', label: 'Containers / Docker / k8s', desc: 'Linux as the substrate for containerized workloads', icon: '⧈' },
  { id: 'desktop', label: 'Desktop', desc: 'Using Linux as your daily-driver OS', icon: '◐' },
  { id: 'embedded', label: 'Embedded / SBC', desc: 'Raspberry Pi, edge devices, IoT', icon: '⛬' },
  { id: 'fundamentals', label: 'Just learn Linux', desc: 'Foundations first — shell, filesystem, processes', icon: '#' },
];

const GLOSSARY = {
  Kernel: "The core of the OS — manages memory, processes, devices, networking. Linux kernel is just the kernel; combined with GNU tools + init system + apps = a distribution.",
  Distribution: "A complete OS built around the Linux kernel. Includes init system, package manager, shell, GUI (optional), default apps. Ubuntu, Debian, Fedora, Arch, Alpine, etc.",
  Shell: "Command interpreter — translates your typed commands into kernel calls. Bash is most common; zsh (macOS default), fish, dash (sh-compatible). POSIX sh is the lowest common denominator.",
  Bash: "Bourne Again Shell — GNU's bash. Default on most Linux distros. Sophisticated: history, completion, arrays, arithmetic, regex matching. Scripts use #!/bin/bash.",
  POSIX: "Portable Operating System Interface — IEEE standard defining Unix-like behavior. POSIX sh is the minimal portable shell; scripts targeting it work everywhere.",
  PID: "Process ID. Unique integer per running process. PID 1 is init (systemd on modern distros). Parent PID (PPID) tracks process tree.",
  Fork: "System call that creates a copy of the current process. The child gets a new PID but identical memory. Foundation of how processes are created on Unix.",
  Exec: "System call that replaces the current process's program with a new one. fork() + exec() is how shells run commands: fork a child, exec the new program in it.",
  Signal: "Asynchronous notification to a process. SIGTERM (15, polite termination), SIGKILL (9, can't be ignored), SIGINT (2, Ctrl+C), SIGHUP (1), SIGSTOP/SIGCONT, etc.",
  Process: "A running program with memory, file descriptors, environment, and a PID. Multiple processes can run the same program.",
  Thread: "A lightweight unit of execution within a process. Threads share memory; processes don't. Linux treats threads as processes that share resources (Light-Weight Processes).",
  cgroup: "Control group — kernel feature to limit, account for, and isolate resource usage (CPU, memory, I/O) for groups of processes. Foundation of containers.",
  Namespace: "Kernel feature isolating system resources. Pid, mount, network, user, IPC, UTS namespaces let processes have their own view of the system. Foundation of containers.",
  Container: "A process (or group) running in isolated namespaces + cgroups. Not a VM — same kernel, just isolated. Docker, Podman, LXC orchestrate this.",
  systemd: "The dominant init system + service manager. PID 1 on most distros. Manages units (services, timers, mounts, sockets). journalctl reads its logs.",
  Init: "PID 1. The first userspace process started by the kernel. Responsible for starting all other services. systemd, sysvinit, OpenRC, runit are init systems.",
  Service: "A daemon or background process managed by init. systemd unit type 'service'. nginx.service, sshd.service, postgresql.service.",
  Journal: "systemd's structured log store, queryable with journalctl. Replaces /var/log/syslog on systemd-based distros. Persists across boots if configured.",
  Inode: "Filesystem object identifier — points to file data + metadata (permissions, owner, size, timestamps) but NOT the name. Names live in directory entries pointing to inodes.",
  "Hard link": "A directory entry pointing to the same inode as another. Two names for one file. Can't span filesystems. Deleting one doesn't affect the other.",
  "Symbolic link": "A special file containing a path. Acts as a pointer. Can span filesystems, can target nonexistent files. ln -s.",
  Mount: "Attaching a filesystem to a directory in the tree. /etc/fstab lists permanent mounts. /proc, /sys, /dev are virtual filesystems mounted at boot.",
  FHS: "Filesystem Hierarchy Standard. Defines /, /etc, /var, /usr, /home, /tmp, /opt and their meanings. Why every Linux distro looks roughly the same.",
  proc: "/proc — virtual filesystem exposing kernel + process info as files. cat /proc/cpuinfo, /proc/meminfo, /proc/PID/status. Read-only mostly.",
  sys: "/sys — sysfs. Exposes kernel objects (devices, modules, kernel parameters) as a hierarchy. /sys/class/net/eth0/. Configurable in places.",
  dev: "/dev — device files. /dev/sda (disk), /dev/null, /dev/random, /dev/tty. Created dynamically by udev/devtmpfs.",
  "File descriptor": "Integer handle to an open file/socket/pipe. 0 = stdin, 1 = stdout, 2 = stderr. Returned by open(); used in read()/write()/close().",
  Pipe: "Connects stdout of one command to stdin of another. command1 | command2. Composing small tools is core Unix philosophy.",
  Redirect: "Send command's output (or input) to/from a file. > overwrites, >> appends, < reads from. 2> redirects stderr; 2>&1 merges stderr into stdout.",
  Pseudoterminal: "/dev/pts/* — a virtual terminal pair (master + slave). What your terminal emulator + ssh sessions use.",
  Umask: "Default permission mask for new files. Subtracted from full permissions: umask 022 → 755 for dirs, 644 for files. Set in shell profile.",
  Capability: "Per-process privilege. Splits root's powers — CAP_NET_BIND_SERVICE (bind <1024), CAP_NET_ADMIN, CAP_SYS_ADMIN, etc. Finer-grained than root/non-root.",
  ACL: "Access Control List. Extends rwx with per-user/group permissions: setfacl, getfacl. Most filesystems support; rarely needed beyond standard permissions.",
  sudo: "Run commands as another user (usually root). /etc/sudoers defines who can do what. Authentication audited. Replaces 'su -' for privilege escalation.",
  SELinux: "Security-Enhanced Linux. Mandatory access control — policies define what subjects (processes) can access what objects. Default on RHEL/Fedora. Often disabled by frustrated admins.",
  AppArmor: "Mandatory access control via path-based profiles. Default on Ubuntu/Debian. Easier than SELinux to author.",
  Package: "An installable software bundle: binaries, libraries, config files, metadata. Format varies by distro family (deb, rpm, pkg.tar.zst).",
  apt: "Advanced Package Tool. Debian/Ubuntu package manager. apt install, apt update, apt upgrade. Configures /etc/apt/sources.list.",
  dnf: "Dandified YUM. Fedora/RHEL/CentOS package manager. dnf install, dnf upgrade. Configures /etc/yum.repos.d/.",
  pacman: "Arch Linux package manager. pacman -Syu (sync + upgrade), pacman -S (install). Rolling release.",
  snap: "Canonical's universal package format. Sandboxed, auto-updating. Controversial in some circles. snap install.",
  Flatpak: "Distro-agnostic application packaging with sandboxing via portals. Flathub is the central repo. Common for desktop apps.",
  Repository: "Server hosting packages. Distros ship with default repos; you can add third-party ones. /etc/apt/sources.list, /etc/yum.repos.d/.",
  TTY: "Teletypewriter. A terminal interface. Linux has 6 text TTYs by default (Ctrl+Alt+F1-F6) + X/Wayland on F7. `tty` command shows your current one.",
  X11: "X Window System. Legacy graphical layer. Network-transparent, complex, being replaced by Wayland on modern systems.",
  Wayland: "Modern graphical protocol replacing X11. Simpler, more secure, better multi-monitor. Default on Fedora, Ubuntu 22.04+, GNOME.",
  Daemon: "Long-running background process. Conventionally named with 'd' suffix (sshd, httpd, systemd). Usually started by init at boot.",
  Cron: "Time-based job scheduler. /etc/crontab + /etc/cron.{hourly,daily,weekly}. systemd timers are the modern alternative.",
  "Hot path": "Frequently-executed code/disk path. Hot paths get cached aggressively. Cold paths trigger I/O. Why first run is slow, subsequent fast.",
  "Page cache": "Kernel's cache of disk reads. RAM not in use is used as cache. Why `free` shows little 'free' memory — it's not wasted, it's caching.",
  OOM: "Out Of Memory. When the kernel can't allocate, it invokes the OOM killer — selects a process to kill based on score. /proc/PID/oom_score.",
  swap: "Disk-backed virtual memory. Used when RAM fills. Slow. Modern advice: configure but expect it to be rarely used; better to add RAM or fix memory bugs.",
  Tarball: "tar archive, usually gzipped (.tar.gz / .tgz) or zstd (.tar.zst). Bundles many files. tar xvzf, tar cvzf. Doesn't compress directories — bundles, then compression layer.",
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "Who started Linux and when?",
      opts: [ "Richard Stallman, 1983", "Linus Torvalds, 1991 — initial announcement on comp.os.minix", "Andrew Tanenbaum, 1987" ],
      a: 1,
      x: "Linus Torvalds posted to comp.os.minix on August 25, 1991: 'I'm doing a (free) operating system (just a hobby, won't be big and professional like gnu) for 386(486) AT clones.' Kernel 0.01 released September 1991. Combined with GNU's userland tools (Stallman's project since 1983), the GNU/Linux operating system was born. Kernel 1.0: March 1994."
    },
    {
      qid: 'o2',
      q: "What's the current Linux kernel version (May 2026)?",
      opts: [
        "Linux 5.x — that's still mainline",
        "Linux 7.0 (released April 12, 2026); 7.0.10 latest stable as of May 23, 2026",
        "There is no version numbering"
      ],
      a: 1,
      x: "Linux 7.0 released April 12, 2026 — the big version bump from 6.x after 6.19 (Feb 2026). Current stable: 7.0.10 (May 23, 2026). Long-term support kernels still maintained: 6.18, 6.12, 6.6, 6.1, 5.15, 5.10. Rust support in the kernel is mature; bcachefs is upstream; io_uring is the future of async I/O."
    },
    {
      qid: 'o3',
      q: "What's the difference between 'Linux' and 'a Linux distribution'?",
      opts: [
        "They're identical",
        "Linux is just the kernel. A distribution (Ubuntu, Fedora, Arch, Alpine) combines the kernel with GNU tools, an init system, package manager, shell, optional GUI, and curated software.",
        "Linux is desktop, distro is server"
      ],
      a: 1,
      x: "Strict purists say 'GNU/Linux' to acknowledge GNU's userland tools are most of what you actually use. The kernel does memory management, scheduling, I/O. The distro provides the apt/dnf, the bash, the systemd, the everything-else. Same kernel, vastly different distributions."
    },
  ],
  shell: [
    {
      qid: 's1',
      q: "What does `command1 | command2` do?",
      opts: [
        "Runs them in parallel",
        "Pipes stdout of command1 into stdin of command2. The output of the first becomes the input of the second.",
        "Runs command2 only if command1 fails"
      ],
      a: 1,
      x: "Pipes are Unix's killer feature — compose small tools by chaining I/O. ls | grep .txt | wc -l counts text files. Each program is a filter; pipes connect them. The pipe runs both commands concurrently, streaming data between them."
    },
    {
      qid: 's2',
      q: "What's the difference between `>` and `>>` ?",
      opts: [
        "They're the same",
        "> overwrites the file (truncates first). >> appends to it. Both redirect stdout.",
        ">> is for stderr"
      ],
      a: 1,
      x: "echo hi > log.txt — overwrites log.txt with 'hi'. echo bye >> log.txt — appends 'bye'. Stderr is 2: 2> log.err. Merge: 2>&1 (redirect stderr to where stdout currently points). &> redirects both (bash extension)."
    },
    {
      qid: 's3',
      q: "Why use `\"$var\"` instead of `$var` in shell scripts?",
      opts: [
        "Habit",
        "Quoting prevents word splitting + glob expansion. Unquoted $var with spaces becomes multiple arguments; quoted, it stays as one. Single biggest source of shell bugs.",
        "It's faster"
      ],
      a: 1,
      x: "$file with file='my doc.txt' becomes TWO arguments: 'my' and 'doc.txt'. \"$file\" stays as one argument 'my doc.txt'. Same with globs: $pattern expands wildcards; \"$pattern\" doesn't. ShellCheck (shellcheck.net) flags every instance — run it on every script you write."
    },
  ],
  fs: [
    {
      qid: 'f1',
      q: "What does /proc actually contain?",
      opts: [
        "Process binaries",
        "Virtual files exposing kernel state + running processes. /proc/cpuinfo, /proc/meminfo, /proc/PID/status. Read-mostly; reading 'pulls' current info from kernel.",
        "Backup of /"
      ],
      a: 1,
      x: "/proc is a 'procfs' — virtual filesystem. Files don't exist on disk; they're generated by the kernel on read. cat /proc/uptime → seconds since boot. cat /proc/PID/cmdline → process's command line. /proc/sys/ is configurable. Linux's introspection lives here."
    },
    {
      qid: 'f2',
      q: "Hard link vs symbolic link?",
      opts: [
        "Same",
        "Hard link = another directory entry for the same inode (data). Can't span filesystems. Symbolic link = a special file containing a path. Can target anything, including nonexistent files.",
        "Hard links are for files, symlinks for directories"
      ],
      a: 1,
      x: "ln file hardlink — creates new name pointing to same data. ln -s file symlink — creates pointer. ls -l on a symlink shows 'symlink -> target'. Delete the hard link — file still exists if other names point to inode. Delete symlink target — symlink dangles."
    },
  ],
  proc: [
    {
      qid: 'p1',
      q: "What signal does `kill -9` send, and why is it different?",
      opts: [
        "Same as plain kill",
        "SIGKILL (signal 9). The process CANNOT catch or ignore it; the kernel terminates immediately. Default kill sends SIGTERM (15) which the process can catch + clean up.",
        "It's just kill with priority"
      ],
      a: 1,
      x: "Default kill = SIGTERM (15) = polite request. Process can run cleanup handlers, flush buffers, close files. SIGKILL (9) = kernel termination, no cleanup. Use SIGTERM first, give it a few seconds, escalate to SIGKILL only if needed. Killing a process with SIGKILL skips cleanup — may leak resources or corrupt data."
    },
    {
      qid: 'p2',
      q: "What's a zombie process?",
      opts: [
        "A virus",
        "A process that has exited but whose parent hasn't called wait() to read its exit status. The PID + exit code linger in the process table until parent reaps it (or init does if parent died first).",
        "A frozen process"
      ],
      a: 1,
      x: "Zombies (Z state in ps) consume no resources except a PID slot. They accumulate when a buggy parent forks children but never wait()s. Fix: kill the parent (init then reaps the orphans) or fix the parent code. A few zombies is normal; thousands is a bug."
    },
  ],
  perms: [
    {
      qid: 'pm1',
      q: "What does `chmod 755` mean?",
      opts: [
        "Random",
        "Owner rwx (7 = 4+2+1), group r-x (5 = 4+0+1), others r-x. Standard for executables + directories.",
        "Same as 777"
      ],
      a: 1,
      x: "Octal: r=4, w=2, x=1. First digit = owner, second = group, third = others. 755 = rwxr-xr-x. 644 = rw-r--r-- (typical for files). 700 = rwx------ (private dir). chmod g+w file → add group write. chmod -R 755 dir → recursive."
    },
    {
      qid: 'pm2',
      q: "Why is chmod 777 considered a security smell?",
      opts: [
        "Performance",
        "Anyone on the system can read, write, and execute. Any vulnerability in any process running as any user becomes a foothold. 'World writable' is one of the easiest things to spot in a security audit.",
        "It uses more disk"
      ],
      a: 1,
      x: "777 grants everyone write access. On multi-user systems or shared servers, this is a direct privilege escalation path: write a shell script, chmod +x, run as you. Even on single-user systems, any process that gets compromised can rewrite the file. Use specific permissions: 644 for files, 755 for dirs/executables. 777 is almost always wrong."
    },
  ],
  net: [
    {
      qid: 'n1',
      q: "What replaced `ifconfig` on modern Linux?",
      opts: [
        "Nothing",
        "The `ip` command (from iproute2). ip addr (instead of ifconfig), ip route (instead of route), ip link. More features, consistent syntax, IPv6-native. ifconfig is deprecated, not in default installs of newer distros.",
        "`nslookup`"
      ],
      a: 1,
      x: "iproute2 superseded the old net-tools (ifconfig, route, netstat) in the early 2010s. ip addr, ip route, ip link, ss (replaces netstat for sockets). Many tutorials still teach the old commands; they often aren't installed by default in 2026. Learn iproute2."
    },
  ],
  systemd: [
    {
      qid: 'sd1',
      q: "How do you check if a systemd service is running, and read its recent logs?",
      opts: [
        "tail /var/log/messages",
        "systemctl status nginx (shows running state + recent log lines). journalctl -u nginx -f (follow logs). journalctl -u nginx --since '1 hour ago'.",
        "ps aux | grep nginx"
      ],
      a: 1,
      x: "systemctl is the command for managing units. status, start, stop, restart, reload, enable (start at boot), disable. journalctl reads systemd's structured journal. -u filters by unit, -f follows, --since/--until time-bounds, -p err filters by priority. Modern Linux: forget /var/log; use journalctl."
    },
  ],
  pkg: [
    {
      qid: 'pk1',
      q: "What does `apt update` actually do?",
      opts: [
        "Upgrades all packages",
        "Refreshes the local cache of available packages + versions from configured repositories. Does NOT install or upgrade. `apt upgrade` then installs available upgrades.",
        "Updates the kernel"
      ],
      a: 1,
      x: "apt update = refresh metadata (no system changes). apt upgrade = install upgrades that don't change package dependencies. apt full-upgrade = upgrades including removing/installing dependencies. Run update before upgrade. dnf has similar: dnf check-update, dnf upgrade."
    },
  ],
  atlas: [
    {
      qid: 'at1',
      q: "What separates competent Linux users from senior ones?",
      opts: [
        "Memorizing every command",
        "Fluent shell + understanding of processes, signals, file descriptors, systemd, /proc; reading man pages comfortably; debugging with strace/lsof/journalctl; the willingness to read source when docs fail. The intuition compounds with years of operating things.",
        "Knowing every distro"
      ],
      a: 1,
      x: "Linux mastery is a long-tail skill. Surface knowledge (commands, syntax) is the first 10%. The remaining 90% is intuition: when something is wrong, knowing which tool to reach for. journalctl when a service is acting up. strace when a binary is mysteriously failing. lsof when something has files open. /proc/PID/* for everything else. man pages aren't a crutch — they're the primary docs."
    },
  ],
};

const COMPARISONS = {
  signals: {
    title: 'Signals worth knowing',
    headers: ['Signal', '#', 'Catchable?', 'Used for'],
    rows: [
      ['SIGHUP', '1', 'Yes', "Reload config (daemons); terminal hang-up"],
      ['SIGINT', '2', 'Yes', "Ctrl+C — interrupt request"],
      ['SIGQUIT', '3', 'Yes', "Ctrl+\\ — like SIGINT but with core dump"],
      ['SIGKILL', '9', 'NO', "Kernel-level termination. Process can't catch or ignore."],
      ['SIGTERM', '15', 'Yes', "Default kill signal. Polite termination request."],
      ['SIGSTOP', '19', 'NO', "Pause process. SIGCONT resumes."],
      ['SIGCONT', '18', 'Yes', "Resume a stopped process."],
      ['SIGUSR1/2', '10/12', 'Yes', "User-defined signals — apps use however they want"],
      ['SIGPIPE', '13', 'Yes', "Wrote to a pipe with no reader. Often kills programs."],
      ['SIGCHLD', '17', 'Yes', "Child process changed state. Parent uses to know to call wait()."],
    ],
  },
  permissions: {
    title: 'Permission octal cheatsheet',
    headers: ['Octal', 'Symbolic', 'Meaning'],
    rows: [
      ['0', '---', "No permission"],
      ['1', '--x', "Execute only (for dirs: traverse, no list)"],
      ['2', '-w-', "Write only — rare"],
      ['3', '-wx', "Write + execute, no read"],
      ['4', 'r--', "Read only"],
      ['5', 'r-x', "Read + execute. Standard for shared files/dirs."],
      ['6', 'rw-', "Read + write. Standard for personal files."],
      ['7', 'rwx', "Full access. Common for owner of executables/dirs."],
      ['644', 'rw-r--r--', "Standard FILE: owner can write, others read."],
      ['755', 'rwxr-xr-x', "Standard EXEC/DIR: owner full, others read+execute."],
      ['600', 'rw-------', "Private file (ssh keys). Owner only."],
      ['700', 'rwx------', "Private dir."],
      ['777', 'rwxrwxrwx', "World writable — almost always WRONG."],
    ],
  },
  distros: {
    title: 'Distro families — 2026',
    headers: ['Distro', 'Family', 'Package mgr', 'Best for'],
    rows: [
      ['Debian', 'Debian', 'apt (.deb)', "Servers, stability, conservative. The grandfather distro."],
      ['Ubuntu', 'Debian (downstream)', 'apt (.deb) + snap', "Servers + desktops. Canonical-supported. LTS every 2 years."],
      ['Fedora', 'Red Hat (upstream)', 'dnf (.rpm)', "Bleeding-edge GNU/Linux. New kernel + tools first. Workstation focus."],
      ['RHEL / Rocky / Alma', 'Red Hat', 'dnf (.rpm)', "Enterprise servers. Long support cycles, conservative changes."],
      ['Arch', 'Arch', 'pacman (.pkg.tar.zst)', "Rolling release, minimal, DIY. For users who want to know every package."],
      ['Alpine', 'Independent', 'apk', "Tiny (5 MB base). musl libc, BusyBox. Default in many containers."],
      ['NixOS', 'Nix', 'nix', "Declarative, reproducible. Whole OS configured in code. Steep learning curve."],
      ['openSUSE', 'SUSE', 'zypper (.rpm)', "European enterprise lineage. Tumbleweed (rolling) + Leap (stable)."],
    ],
  },
  pkgmgrs: {
    title: 'Package manager cheat sheet',
    headers: ['Action', 'apt (Debian)', 'dnf (Fedora)', 'pacman (Arch)'],
    rows: [
      ['Update metadata', 'apt update', 'dnf check-update', 'pacman -Sy'],
      ['Install package', 'apt install pkg', 'dnf install pkg', 'pacman -S pkg'],
      ['Remove package', 'apt remove pkg', 'dnf remove pkg', 'pacman -R pkg'],
      ['Search', 'apt search term', 'dnf search term', 'pacman -Ss term'],
      ['Upgrade all', 'apt upgrade', 'dnf upgrade', 'pacman -Syu'],
      ['Show info', 'apt show pkg', 'dnf info pkg', 'pacman -Si pkg'],
      ['List installed', 'apt list --installed', 'dnf list installed', 'pacman -Q'],
      ['Owns this file?', 'dpkg -S /path', 'rpm -qf /path', 'pacman -Qo /path'],
    ],
  },
};

const ANTIPATTERNS = [
  { name: "chmod 777", reason: "World-writable. Any user (or compromised process running as any user) can rewrite. Almost always wrong. Use specific permissions: 644 files, 755 dirs/executables, 600/700 for sensitive." },
  { name: "rm -rf without thinking", reason: "No undelete on Linux. rm -rf $VAR with empty VAR = rm -rf /. Always: pwd before running; use rm -ri (interactive) when unsure; pipe to less first to see what would be deleted." },
  { name: "Running everything as root", reason: "Single small bug = full system compromise. Use a regular user; sudo when needed. SSH as root: disable in /etc/ssh/sshd_config (PermitRootLogin no). Even on personal machines, the discipline pays off." },
  { name: "Unquoted variables in scripts", reason: "$file with spaces becomes multiple args. \"$file\" stays as one. Single biggest source of shell bugs. shellcheck.net flags every instance — install + run on every script." },
  { name: "curl | sh from random URLs", reason: "Executes whatever the server sends, NOW. Compromised server or MITM = your machine. Acceptable for KNOWN sources you'd trust anyway (rust-lang.org, ohmyzsh installer); for anything else, download → audit → run." },
  { name: "Editing /etc files without backups", reason: "cp /etc/foo.conf /etc/foo.conf.bak before any change. Or use 'etckeeper' to git-track /etc. Worst case is a broken boot from a sshd_config typo — keep a recovery path." },
  { name: "Ignoring exit codes in scripts", reason: "Bash continues after errors unless you tell it not to. Use 'set -euo pipefail' at the top: -e exit on error, -u error on unset var, -o pipefail propagate pipe errors. Saves so much pain." },
  { name: "sudo apt upgrade -y on production", reason: "Auto-confirming upgrades = surprise downtime. Stage upgrades. Read changelogs for major packages. Test in staging. For production: unattended-upgrades configured deliberately, not blanket -y." },
  { name: "Using `which` instead of `command -v`", reason: "`which` is an external program with inconsistent output across systems. `command -v` is built-in POSIX, predictable. Habit worth changing." },
  { name: "Logging into /var/log/myapp.log manually", reason: "On systemd distros, use journald + journalctl. Centralized, structured, queryable by service/time/priority. Apps that write their own log files bypass this — push them through stdout/stderr instead." },
];

const COMMANDS = [
  { cmd: 'ls -lah', desc: "List files with details: -l long format, -a all (including hidden), -h human-readable sizes. The most-typed Linux command." },
  { cmd: 'cd / cd - / cd ~', desc: "Change directory. `cd -` returns to previous. `cd ~` (or just `cd`) goes home. `cd ..` up one level." },
  { cmd: 'pwd', desc: "Print working directory. Where am I right now?" },
  { cmd: 'find /path -name "*.log" -mtime -7', desc: "Recursive search. -name pattern, -mtime -7 modified within 7 days. Pair with -exec or | xargs to act on results." },
  { cmd: 'grep -rn "TODO" .', desc: "Recursive grep. -r recursive, -n with line numbers. `grep -rin` adds case-insensitive. ripgrep (rg) is the modern faster alternative." },
  { cmd: 'ps aux | grep nginx', desc: "All processes (aux = all users, with details, including no-TTY). Pipe to grep to filter. `pgrep nginx` is cleaner; `pkill nginx` to terminate by name." },
  { cmd: 'top / htop', desc: "Real-time process view. htop is friendlier (color, scrolling, mouse). Sort by CPU/memory, kill processes interactively." },
  { cmd: 'df -h / du -sh *', desc: "df: disk free space per filesystem. du: disk usage per directory. -h human-readable. `du -sh *` sizes of each item in current dir." },
  { cmd: 'systemctl status nginx', desc: "Service state + recent logs + last exit code. start/stop/restart/reload/enable/disable. The most-used systemd command." },
  { cmd: 'journalctl -u nginx -f --since "1 hour ago"', desc: "Logs for a service. -u unit, -f follow (tail), --since time. -p err filters by priority. Powerful structured log querying." },
  { cmd: 'tail -f /var/log/messages', desc: "Watch a log file in real time. -f follow. -n 100 starts with last 100 lines. journalctl -f is the systemd equivalent." },
  { cmd: 'ip addr / ss -tlnp', desc: "ip addr = show interfaces + IPs (replaces ifconfig). ss -tlnp = TCP listening sockets with process info (replaces netstat). iproute2 is the modern toolkit." },
  { cmd: 'tar xvzf archive.tar.gz', desc: "Extract tarball. x extract, v verbose, z gzip, f file. tar cvzf creates. .tar.xz needs J instead of z; .tar.zst needs --zstd." },
  { cmd: 'rsync -avz src/ dest/', desc: "Sync files/directories. -a archive (preserves perms/times), -v verbose, -z compress in transit. Trailing slash matters: src/ vs src." },
  { cmd: 'ssh -i ~/.ssh/key user@host', desc: "SSH with specific key. ~/.ssh/config aliases simplify life. ssh-keygen -t ed25519 to generate. ssh-copy-id user@host installs your pubkey." },
  { cmd: 'sudo / sudo -i / sudo -u other', desc: "Run as root briefly; -i interactive root shell; -u other run as a different user. /etc/sudoers controls who can do what." },
];

const RESOURCES = [
  { name: "The Linux Command Line", url: 'linuxcommand.org/tlcl.php (free PDF)', note: "William Shotts. Free 555-page book. The single best Linux + bash introduction. Read cover to cover if you're new.", kind: 'book' },
  { name: "Linux From Scratch", url: 'linuxfromscratch.org', note: "Build a Linux system from source, package by package. Brutal + educational. Don't run it as your daily driver; do it once to understand what a distro actually is.", kind: 'tutorial' },
  { name: "Julia Evans zines", url: 'wizardzines.com', note: "Illustrated quick-reference zines on bash, networking, processes, debugging tools. Friendly, deep, surprisingly current. Paid; worth it.", kind: 'book' },
  { name: "Arch Wiki", url: 'wiki.archlinux.org', note: "The single best Linux reference, regardless of distro. Surprisingly applicable to any distro. Search-engine results land here for a reason.", kind: 'reference' },
  { name: "man pages — `man 7 signal`, `man 5 fstab`", note: "Reference: section 1 = commands, 2 = syscalls, 3 = library, 5 = file formats, 7 = miscellany. man -k keyword searches. Read them. They're the source of truth.", kind: 'reference', url: 'on every Linux system' },
  { name: "systemd man pages — `man systemd.service`", note: "systemd's docs are extensive + actually good. systemd.unit, systemd.service, systemd.timer, journalctl, systemctl. Better than most blog posts about systemd.", kind: 'reference', url: 'on every modern Linux system' },
  { name: "Linux Kernel Documentation", url: 'kernel.org/doc/html/latest', note: "The kernel's own docs. /proc layout, cgroup v2, namespaces, scheduling. Dense; pays off for kernel-adjacent debugging.", kind: 'reference' },
  { name: "Brendan Gregg — Linux Performance", url: 'brendangregg.com/linuxperf.html', note: "Performance engineer at Netflix/Intel. THE source for Linux perf tooling: perf, eBPF, flame graphs. Talks + books + blog.", kind: 'reference' },
  { name: "ShellCheck", url: 'shellcheck.net', note: "Online + CLI. Lints shell scripts. Catches every unquoted-variable bug + a hundred others. Run on every script you write. The single highest-ROI tool.", kind: 'tool' },
  { name: "tldr pages", url: 'tldr.sh', note: "Concise example-based command help. `tldr tar` shows the 5 things you actually want. Faster than man pages when you've forgotten syntax.", kind: 'tool' },
  { name: "explainshell.com", url: 'explainshell.com', note: "Paste a complex shell command, get every part explained. Excellent for understanding inherited scripts.", kind: 'tool' },
  { name: "DistroWatch", url: 'distrowatch.com', note: "Tracking + comparing every Linux distro. Useful when picking one for a new use case. The popularity ranking is widely misread; use for the per-distro docs.", kind: 'reference' },
];

const PERSONALIZED = {
  server: {
    spark: "Server ops: master systemd (services + timers + journalctl), ssh hardening, iptables/nftables basics, unattended-upgrades on Debian/Ubuntu. Your Coolify VPSes are Linux servers — every skill applies.",
    shell: "Server: every command goes through SSH. Master bash + tmux/screen (so you don't lose work when SSH drops). Aliases + functions in ~/.bashrc. shellcheck every script.",
    systemd: "Server: most production services run as systemd units. Write your own unit files (under /etc/systemd/system/). journalctl -u service -f is your debugging starting point.",
    library: "Server: systemd recipes, shell one-liners for ops, networking (ip/ss/iptables), security (SSH hardening, fail2ban), debugging (strace, lsof, journalctl).",
  },
  containers: {
    spark: "Containers: Linux primitives (namespaces, cgroups) ARE containers. Understand them and Docker stops feeling magical. The Docker Atlas covers Docker; this atlas covers what's underneath.",
    shell: "Containers: alpine-linux images use sh (not bash), busybox (limited tool subset). Scripts must be POSIX-compatible. Test with dash (Debian's /bin/sh).",
    systemd: "Containers usually DON'T use systemd inside — they run a single process (PID 1). systemd lives on the HOST. The container == 1 process; the systemd unit on host == 1 container.",
    library: "Containers: shell one-liners (POSIX-careful), cgroups + namespaces (understanding what containers are), debugging (docker logs, exec, inspect).",
  },
  desktop: {
    spark: "Desktop: pick a distro. Fedora (cutting edge, polished), Ubuntu (broadest support), Pop!_OS (Ubuntu+), Arch (DIY, rolling). Stick with one for 6+ months to actually learn it.",
    shell: "Desktop: configure your shell. zsh + oh-my-zsh or fish. Configure ~/.bashrc / ~/.zshrc with aliases. Install starship for a nice prompt. Make it yours.",
    systemd: "Desktop: same systemd as servers. Add ~/.config/systemd/user/ unit files for personal services + timers (backups, syncs).",
    library: "Desktop: shell setup, package management (apt/dnf/flatpak), debugging when something acts up. Build the OS into your daily workflow.",
  },
  embedded: {
    spark: "Embedded: Raspberry Pi OS (Debian-derived), Armbian, BalenaOS. Storage matters — SD cards die from too many writes. Use overlay filesystems or tmpfs for variable data.",
    shell: "Embedded: BusyBox shell often, limited disk. Cross-compilation matters for x86 → ARM. Scripts must be small + portable.",
    systemd: "Embedded: systemd is overkill; many use OpenRC, runit, or BusyBox init. But Pi runs full systemd. Custom unit files for startup logic.",
    library: "Embedded: shell (POSIX, BusyBox), networking (configuring interfaces), disk management (avoiding SD card wear), debugging (limited tools).",
  },
  fundamentals: {
    spark: "Best path: install Linux in a VM (VirtualBox, UTM on Mac, WSL on Windows). Daily-drive it for 2-3 months. Don't use the GUI for anything you could do in the shell.",
    shell: "Fundamentals: TLCL book cover to cover. Type every example. Build muscle memory for ls, cd, cat, grep, find, pipes, redirects. Make ~/.bashrc your own.",
    systemd: "Fundamentals: learn systemctl + journalctl. Write a service unit for a simple script. Set up a timer. journalctl -xe when something fails. It clicks once you do this.",
    library: "Fundamentals: all 8 categories. Shell first. Then permissions + filesystem. Then systemd. Then networking + performance + debugging. Then package management.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What's broken?",
    opts: [
      { label: "💾 Out of disk space", next: 'disk' },
      { label: "💀 Process won't die / runaway CPU", next: 'runaway' },
      { label: "🚫 Permission denied", next: 'perm' },
      { label: "⚙ systemd service won't start", next: 'service' },
      { label: "💥 OOM killer just killed my process", next: 'oom' },
      { label: "🐢 System is slow", next: 'slow' },
      { label: "🌐 Network not working", next: 'net' },
      { label: "🔐 Locked myself out / can't sudo", next: 'lockout' },
    ],
  },
  disk: {
    fix: "Find what's eating the disk. The two big buckets: logs and forgotten cruft.",
    steps: [
      "df -h — which filesystem is full? Pay attention to / vs /home vs /var. inode exhaustion: df -i.",
      "du -sh /var/* 2>/dev/null | sort -h — biggest dirs in /var. Logs (journalctl, /var/log) and Docker (/var/lib/docker) are usual suspects.",
      "Logs: journalctl --disk-usage shows journal size. journalctl --vacuum-time=7d limits to 7 days. journalctl --vacuum-size=500M limits to 500 MB.",
      "Docker: docker system prune -a — removes stopped containers, unused images, build cache. Reclaims gigabytes routinely.",
      "Old kernel images: apt autoremove (Debian/Ubuntu) — removes obsolete kernels. /boot fills up otherwise.",
      "ncdu /path — interactive disk usage browser. ncdu -x / scans / without crossing filesystem boundaries. The best tool when you need to find the big stuff fast.",
      "lsof | grep deleted — files deleted but still held open by a process. Restart the process or reboot to actually reclaim.",
    ],
  },
  runaway: {
    fix: "Find the process, escalate signals if needed. SIGKILL only as last resort.",
    steps: [
      "top or htop — sort by CPU or memory. Note the PID.",
      "kill PID — sends SIGTERM (15). Process gets chance to clean up. Wait 5-10 seconds.",
      "kill -9 PID — SIGKILL. Kernel-level termination. Use ONLY if SIGTERM didn't work; cleanup is skipped.",
      "killall name OR pkill pattern — by name. pkill -f matches against full command line.",
      "Process won't die even with -9? It's in 'D' state (uninterruptible I/O wait — kernel-side). Can't be killed; must wait for I/O or reboot. Usually disk or network hang.",
      "Process is a child of init/systemd? systemctl stop unit-name. Don't kill PID 1 children directly.",
      "Defending against it next time: cgroup limits, systemd CPUQuota=, MemoryMax=.",
    ],
  },
  perm: {
    fix: "Read the error carefully. Linux tells you which file + what access was denied.",
    steps: [
      "ls -la file — what are the actual permissions + owner? Compare to who you are (whoami) and your groups (groups).",
      "You're not the owner + don't have group access? sudo (if allowed) or change perms (if you own the parent).",
      "It's in your home dir but denied? Check parent dir perms — directory needs +x for traversal even if file has read permission.",
      "Permission denied as root? Probably SELinux (Fedora/RHEL) or AppArmor (Ubuntu/Debian). dmesg | grep -i 'denied' or ausearch -m AVC for SELinux. Fix with policy, not by disabling.",
      "Executable file but 'Permission denied' running it? chmod +x file. Or it's noexec mount: mount | grep on_what_filesystem.",
      "Read perms look right but 'Operation not permitted'? Could be attributes — lsattr file. chattr -i file to remove immutable. Capabilities + ACLs also possible.",
    ],
  },
  service: {
    fix: "systemctl + journalctl. The error message tells you what's wrong; you just have to ask.",
    steps: [
      "systemctl status service-name — shows recent log lines + exit code + status. Read the WHOLE output.",
      "journalctl -u service-name -n 100 — last 100 log lines. -p err filters errors. --since '5 min ago' time-bounds.",
      "Config syntax error? Many services have a test command: nginx -t, sshd -t, named-checkconf. Run before restarting.",
      "Port already in use? ss -tlnp | grep :PORT shows what's holding it. Either stop the other or change ports.",
      "Failed to bind low port (<1024)? Service needs CAP_NET_BIND_SERVICE or to start as root. Check unit's User= directive.",
      "Looks fine but doesn't start? systemd-analyze verify /etc/systemd/system/your.service — catches typos.",
      "Permission denied? journalctl will say which file. Check perms + SELinux/AppArmor contexts.",
    ],
  },
  oom: {
    fix: "Kernel killed a process to free memory. Find why, prevent recurrence.",
    steps: [
      "dmesg -T | grep -i 'killed process' — what was killed, when, why.",
      "journalctl -k --since '1 hour ago' | grep -i 'oom' — same info from systemd journal.",
      "/proc/PID/oom_score (before death) — kernel's OOM score. Higher = more likely to be killed. /proc/PID/oom_score_adj can bias.",
      "Why ran out? free -m before + after if you can catch it. ps aux --sort=-rss | head — top memory consumers.",
      "Memory leak in your app? Restart it as a workaround. Profile (valgrind, heap dumps) for real fix.",
      "Bursty workload? Add swap (last resort), reduce concurrency, set MemoryMax= on systemd unit (gets killed cleanly rather than OOM-anyone).",
      "Frequent OOM = either add RAM or fix the memory hog. 'Just disable OOM killer' is wrong — kernel WILL panic otherwise.",
    ],
  },
  slow: {
    fix: "Find the bottleneck: CPU, memory, disk, network.",
    steps: [
      "top or htop — load average + per-process CPU. Load >> core count = CPU-bound.",
      "free -h — memory usage. Lots in cache is FINE (RAM caches disk). Lots in swap is bad (disk is way slower than RAM).",
      "iostat -x 2 — disk I/O. %util near 100% = disk-bound. await high = slow storage.",
      "vmstat 2 — system-wide stats. r column = processes waiting for CPU. b column = waiting for I/O. swap si/so = active swapping (bad).",
      "ss / iftop / nload — network usage. ip -s link show eth0 for cumulative counters.",
      "perf top — CPU profiling. Shows hot functions across the system. Brendan Gregg's flame graphs build on this.",
      "Specific process slow? strace -p PID — see syscalls. Often reveals what it's stuck on.",
    ],
  },
  net: {
    fix: "Layer by layer: IP, route, DNS, firewall, then the app.",
    steps: [
      "ip addr — do you have an IP? If not, DHCP or static config failed.",
      "ip route — is there a default gateway?",
      "ping 1.1.1.1 — does basic connectivity work? Yes = IP fine, DNS or app issue. No = networking broken at IP layer.",
      "ping google.com — DNS works? Test resolver: cat /etc/resolv.conf, dig @8.8.8.8 google.com.",
      "ss -tlnp — what's listening? Local service not bound? Check service config (bind to 0.0.0.0 not 127.0.0.1).",
      "Firewall blocking? iptables -L -n or nft list ruleset. ufw status (Ubuntu), firewall-cmd --list-all (Fedora).",
      "Connection works inside, fails from outside? Cloud security groups, NAT, ISP blocking. Same iptables-style debugging.",
    ],
  },
  lockout: {
    fix: "If you have console access (KVM, VPS web console, physical), you have options. If only SSH and that's broken, harder.",
    steps: [
      "Forgot password? Boot to single-user mode (GRUB → edit kernel line → add `init=/bin/bash` or `rescue.target`). passwd resets it.",
      "sudo doesn't work but you can log in? Likely sudoers misconfig. Boot to single-user (root shell), pkexec visudo (or just edit /etc/sudoers carefully).",
      "SSH broken — locked out of remote server? Use the provider's web console (most VPS providers offer one). DigitalOcean / Hetzner / Linode all have console access.",
      "If you edited sshd_config and broke it: sshd -t shows syntax errors. Always have a second logged-in session before editing sshd_config.",
      "Lesson for next time: 'edit sshd_config; sshd -t; systemctl reload sshd' WITHOUT closing your current session. Test new connection. Then close old.",
      "Disaster recovery: snapshot before risky changes. Rebuild from snapshot if needed. Cheap insurance.",
    ],
  },
};

const ARCH_NODES = [
  { id: 'user', x: 110, y: 18, w: 110, h: 28, label: 'User-space', layer: 'L7', color: '#4ade80', desc: "Your apps, shells, daemons. systemd lives here (PID 1). Restricted from direct hardware access — must go through kernel via syscalls." },
  { id: 'libc', x: 110, y: 58, w: 110, h: 28, label: 'libc / glibc', color: '#4ade80', desc: "C library. Wraps system calls in friendly functions (open, read, malloc). glibc on most distros; musl on Alpine; uclibc on embedded." },
  { id: 'syscall', x: 110, y: 98, w: 110, h: 28, label: 'syscall barrier', color: '#fcd34d', desc: "The boundary between userspace and kernel. ~350 syscalls (open, read, fork, execve, mmap...). strace shows them happening." },
  { id: 'kernel', x: 60, y: 138, w: 210, h: 28, label: 'Linux kernel', color: '#fcd34d', desc: "Scheduling, memory management, IPC, filesystems, networking stacks, security. Single shared kernel across all containers + processes." },
  { id: 'drivers', x: 110, y: 178, w: 110, h: 28, label: 'Device drivers', color: '#fcd34d', desc: "Kernel modules that talk to hardware. Block devices, network, USB, GPU. lsmod lists loaded; modprobe loads + configures." },
  { id: 'hw', x: 110, y: 218, w: 110, h: 28, label: 'Hardware', color: '#71717a', desc: "CPU, RAM, disk, NIC. Kernel is the only thing that talks to it. /proc + /sys expose info." },
];

/* ─── Virtual filesystem for the sandbox ─── */
const VFS_ROOT = {
  type: 'dir',
  children: {
    'home': {
      type: 'dir',
      children: {
        'ada': {
          type: 'dir',
          children: {
            'README.md': { type: 'file', content: "# Welcome to Linux Atlas\n\nThis is your virtual home directory.\n\nTry: ls, cat, cd, pwd, find, grep.\n\nSee `help` for the full command list.\n" },
            'projects': {
              type: 'dir',
              children: {
                'flowfirst': {
                  type: 'dir',
                  children: {
                    'README.md': { type: 'file', content: "# FlowFirst — plumbing lead generation\n\nn8n workflows + landing pages + ad campaigns.\n" },
                    'config.yaml': { type: 'file', content: "name: flowfirst\nenv: production\nport: 3000\nworkers: 4\n" },
                    'deploy.sh': { type: 'file', content: "#!/bin/bash\nset -euo pipefail\ndocker compose up -d\necho 'deployed'\n" },
                  },
                },
                'pipeiq': {
                  type: 'dir',
                  children: {
                    'README.md': { type: 'file', content: "# PipeIQ — county parcel lead scoring\n" },
                    'scrape.py': { type: 'file', content: "import requests\n\ndef fetch_parcels():\n    # PBC ArcGIS endpoint\n    pass\n" },
                  },
                },
              },
            },
            '.bashrc': { type: 'file', content: "# ~/.bashrc\n\nalias ll='ls -lah'\nalias gs='git status'\nexport PATH=\"$HOME/bin:$PATH\"\n" },
            '.ssh': {
              type: 'dir',
              children: {
                'authorized_keys': { type: 'file', content: "ssh-ed25519 AAAA... ada@laptop\n" },
              },
            },
          },
        },
      },
    },
    'etc': {
      type: 'dir',
      children: {
        'hostname': { type: 'file', content: "atlases-prod\n" },
        'os-release': { type: 'file', content: "NAME=\"Ubuntu\"\nVERSION=\"24.04 LTS (Noble Numbat)\"\nID=ubuntu\nVERSION_ID=\"24.04\"\n" },
        'fstab': { type: 'file', content: "# /etc/fstab\nUUID=abc-123  /        ext4  defaults  0 1\nUUID=def-456  /home    ext4  defaults  0 2\ntmpfs         /tmp     tmpfs defaults,size=2G  0 0\n" },
        'passwd': { type: 'file', content: "root:x:0:0:root:/root:/bin/bash\ncle:x:1000:1000:Ada:/home/ada:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n" },
      },
    },
    'var': {
      type: 'dir',
      children: {
        'log': {
          type: 'dir',
          children: {
            'syslog': { type: 'file', content: "May 25 14:23:01 atlases-prod systemd[1]: Started nginx.service.\nMay 25 14:23:05 atlases-prod nginx[1234]: TODO: rotate logs\nMay 25 14:25:12 atlases-prod sshd[1456]: Accepted publickey for ada\nMay 25 14:30:00 atlases-prod CRON[2001]: (ada) CMD (backup.sh)\nMay 25 14:30:08 atlases-prod kernel: [12345.678] eth0: link up\n" },
          },
        },
      },
    },
    'tmp': { type: 'dir', children: {} },
    'usr': {
      type: 'dir',
      children: {
        'bin': { type: 'dir', children: { 'ls': { type: 'file', content: '(binary)' }, 'cat': { type: 'file', content: '(binary)' } } },
      },
    },
  },
};

const CHALLENGES = [
  { id: 'pwd', title: '01 · Where am I?', desc: "Print your current working directory.", check: (s) => s.lastOutput?.trim() === '/home/ada', hint: "pwd" },
  { id: 'ls', title: '02 · List the home directory', desc: "List the contents of /home/ada.", check: (s) => s.lastOutput?.includes('README.md') && s.lastOutput?.includes('projects'), hint: "ls (or ls /home/ada)" },
  { id: 'cd', title: '03 · Navigate into projects/flowfirst', desc: "Change directory to ~/projects/flowfirst, then pwd.", check: (s) => s.cwd === '/home/ada/projects/flowfirst', hint: "cd projects/flowfirst" },
  { id: 'cat', title: '04 · Read the README', desc: "Display the contents of README.md (in your current dir).", check: (s) => s.lastOutput?.includes('FlowFirst'), hint: "cat README.md" },
  { id: 'grep', title: '05 · Find TODO in /var/log/syslog', desc: "Use grep to find lines containing 'TODO' in /var/log/syslog.", check: (s) => s.lastOutput?.includes('rotate logs'), hint: "grep TODO /var/log/syslog" },
  { id: 'find', title: '06 · Find all .md files under /home', desc: "Use find to locate every .md file under /home.", check: (s) => s.lastOutput?.match(/README\.md/g)?.length >= 3, hint: "find /home -name '*.md'" },
  { id: 'pipe', title: '07 · Count lines in /etc/passwd', desc: "Pipe cat /etc/passwd through wc -l to count lines.", check: (s) => s.lastOutput?.trim() === '3', hint: "cat /etc/passwd | wc -l" },
  { id: 'chained', title: '08 · Filter + count', desc: "How many users have /bin/bash as their shell in /etc/passwd? (Use grep + wc -l)", check: (s) => s.lastOutput?.trim() === '2', hint: "grep /bin/bash /etc/passwd | wc -l" },
];

/* ─── Storage helpers ─── */
const STORAGE_PREFIX = 'linuxatlas:';
async function loadKey(key) {
  try {
    const result = await window.storage.get(STORAGE_PREFIX + key);
    if (result?.value) return JSON.parse(result.value);
  } catch (e) {}
  return null;
}
async function saveKey(key, value) {
  try { await window.storage.set(STORAGE_PREFIX + key, JSON.stringify(value)); }
  catch (e) {}
}

const LIBRARY = {
  shell: {
    label: 'Shell',
    icon: '$',
    snippets: [
      {
        id: 'find-xargs',
        title: 'find + xargs — bulk operations',
        desc: "The pattern for doing X to every file matching Y. Replace destructive ops with `echo` first for safety.",
        code: `# Find all .log files modified in the last 7 days
find /var/log -name "*.log" -mtime -7

# Delete all .tmp files older than 30 days (DRY RUN first!)
find /tmp -name "*.tmp" -mtime +30                    # list them
find /tmp -name "*.tmp" -mtime +30 -delete            # delete them

# Use xargs for commands that don't accept find -exec
find . -name "*.txt" | xargs grep -l "TODO"           # files containing TODO
find . -name "*.txt" -print0 | xargs -0 grep -l "TODO"   # null-delim, handles spaces

# Parallelize with xargs -P
find . -name "*.jpg" -print0 | xargs -0 -P 4 -I {} convert {} -resize 800x {}.small

# Find AND act (no xargs needed)
find . -name "*.log" -exec gzip {} \\;                  # gzip each
find . -name "*.log" -exec gzip {} +                   # batch into fewer calls (faster)

# Common patterns
find . -type f -size +100M                            # files >100MB
find . -type d -empty                                 # empty dirs
find . -newer reference-file                          # newer than X
find / -path /proc -prune -o -name "thing" -print     # exclude /proc`,
        note: "find is the underused powertool. Pair with -print0 + xargs -0 when filenames might have spaces. -exec {} + batches calls (way faster than \\; for many files). modern alternative: fd (simpler syntax, sane defaults)."
      },
      {
        id: 'sed-awk',
        title: 'sed + awk — text manipulation',
        desc: "When you need to transform text in pipelines. sed for substitution, awk for column-based work.",
        code: `# sed — substitution
echo "hello world" | sed 's/world/there/'             # hello there
sed -i 's/old/new/g' file.txt                         # in-place, g = all matches
sed -i.bak 's/old/new/g' file.txt                     # creates file.txt.bak first
sed -n '5,10p' file.txt                               # print lines 5-10
sed '/pattern/d' file.txt                             # delete lines matching

# awk — column work (whitespace = default separator)
awk '{print $1}' file.txt                             # first column
awk '{print $1, $NF}' file.txt                        # first + last
awk -F: '{print $1}' /etc/passwd                      # custom separator
awk '$3 > 1000 {print $1}' /etc/passwd                # users with UID > 1000
awk '{sum += $1} END {print sum}' nums.txt            # sum first column
awk 'NR == 1' file.txt                                # first line only
awk 'NR % 2 == 0' file.txt                            # even lines

# Combined: replace, then process
ps aux | awk '/nginx/ {print $2}' | xargs kill        # kill all nginx (carefully)

# Modern alt: rg (ripgrep) for searching, choose (Rust awk) for columns
# But sed + awk are everywhere; learn them.`,
        note: "sed -i is dangerous — back up first (-i.bak). awk is a full language; the patterns above cover 90% of daily use. For complex text transformation, reach for Python; for streaming pipelines, sed/awk."
      },
      {
        id: 'pipes-redirects',
        title: 'Pipes + redirects — the full set',
        desc: "Every shell session uses these. Learn them all once.",
        code: `# Standard streams: 0 stdin, 1 stdout, 2 stderr
command > file              # stdout to file (overwrites)
command >> file             # stdout to file (appends)
command 2> file             # stderr to file
command 2>&1                # merge stderr into stdout
command > file 2>&1         # everything to file
command &> file             # bash shortcut for above
command > /dev/null 2>&1    # discard everything

# Pipes
ls | grep .txt              # connect stdout to stdin of next
ls 2>&1 | grep error        # pipe BOTH stdout and stderr

# Heredoc — multi-line input
cat <<EOF > config.txt
host=localhost
port=5432
EOF

cat <<'EOF'                 # 'EOF' (quoted) = no variable expansion
$VAR stays literal
EOF

# Here-string — single line as input
grep pattern <<< "string to search"

# tee — both write to file AND pass through
command | tee output.log | grep error

# Process substitution
diff <(sort file1) <(sort file2)
comm <(ls dir1) <(ls dir2)`,
        note: "tee is criminally underused. 'command | tee log.txt | other' lets you both save AND continue processing. Process substitution <(cmd) treats cmd's output as a file — works with anything expecting filenames."
      },
      {
        id: 'bash-safety',
        title: 'Safe bash scripts — set -euo pipefail',
        desc: "The four-line preamble every bash script should start with. Catches a hundred classes of bugs.",
        code: `#!/usr/bin/env bash
set -euo pipefail
IFS=$'\\n\\t'

# What each flag does:
# -e  Exit immediately on any non-zero return code (default: bash continues)
# -u  Error on unset variables (default: bash treats unset as "")
# -o pipefail  If any command in a pipe fails, the pipe fails (default: only last matters)
# IFS=$'\\n\\t'  Word-split on newline + tab only (not space)

# Without these:
#   rm -rf $TYPO/   becomes rm -rf / when $TYPO is unset
#   curl X | head   "succeeds" even if curl fails
#   commands keep running after errors

# Patterns that combine well:
[[ -z "\${1:-}" ]] && { echo "Usage: $0 <arg>"; exit 1; }   # require argument
trap 'echo "Error on line $LINENO"' ERR                    # report failure location
trap 'rm -f /tmp/work.$$' EXIT                              # cleanup on exit

# Run shellcheck on every script
shellcheck script.sh                  # local
# or paste at shellcheck.net`,
        note: "set -euo pipefail is the single highest-ROI bash practice. Catches the unquoted variable + missing-typo class of bugs that plague shell scripts. shellcheck catches the rest. Together, your scripts go from 'maybe works' to 'actually correct.'"
      },
    ],
  },
  systemd: {
    label: 'systemd',
    icon: '⚙',
    snippets: [
      {
        id: 'service-unit',
        title: 'Service unit — minimal working example',
        desc: "Run any program as a systemd service. The 50-line file every Linux operator should be able to write.",
        code: `# /etc/systemd/system/my-app.service
[Unit]
Description=My Application
After=network.target
Requires=network.target

[Service]
Type=simple
User=app
Group=app
WorkingDirectory=/opt/my-app
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5s

# Hardening (recommended for any service)
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/my-app/data /var/log/my-app
PrivateTmp=true

# Resource limits (optional)
MemoryMax=512M
CPUQuota=50%

# Logging
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target

# Then:
# sudo systemctl daemon-reload
# sudo systemctl enable --now my-app
# systemctl status my-app
# journalctl -u my-app -f`,
        note: "Type=simple is for foreground processes. forking for traditional daemons. notify for systemd-aware apps. The hardening directives are FREE security — every service should set them. ReadWritePaths whitelists what the service can modify."
      },
      {
        id: 'timer-unit',
        title: 'Timer unit — modern replacement for cron',
        desc: "systemd timers are cron with better logs + dependencies + accuracy options. Pair a .timer with a .service.",
        code: `# /etc/systemd/system/backup.service
[Unit]
Description=Daily backup

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
User=backup
StandardOutput=journal

# /etc/systemd/system/backup.timer
[Unit]
Description=Run backup daily at 3 AM

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true                # if missed (system off), run on next boot
RandomizedDelaySec=15min       # jitter for staggering across machines
Unit=backup.service

[Install]
WantedBy=timers.target

# Enable + start
sudo systemctl enable --now backup.timer

# Check timers
systemctl list-timers
journalctl -u backup.service --since "1 day ago"

# OnCalendar examples:
# minutely / hourly / daily / weekly / monthly
# *-*-* 12:00:00          (daily at noon)
# Mon..Fri *-*-* 09:00:00 (weekdays at 9)
# *-*-01 00:00:00         (first of every month)
# *-*-* 0/15:00           (every 15 minutes)`,
        note: "Why timers beat cron: structured logging (journalctl per timer), dependencies (After=), conditional execution (ConditionPathExists=), Persistent= for missed runs, jitter, sandboxing inherited from systemd unit options. Cron still works fine for simple cases."
      },
      {
        id: 'journalctl-recipes',
        title: 'journalctl recipes',
        desc: "The right journalctl flags for common debugging scenarios.",
        code: `# Tail logs for a service in real time
journalctl -u nginx -f

# Last N lines
journalctl -u nginx -n 100

# Time-bounded
journalctl -u nginx --since "1 hour ago"
journalctl -u nginx --since "2026-05-25 10:00" --until "2026-05-25 12:00"
journalctl --since today --until "1 hour ago"

# By priority (emerg/alert/crit/err/warning/notice/info/debug)
journalctl -p err --since "1 hour ago"        # errors and worse
journalctl -p warning..err                     # range

# Boot-related
journalctl -b                                  # this boot
journalctl -b -1                               # previous boot
journalctl --list-boots                        # all available boots

# Kernel messages
journalctl -k                                  # kernel ring buffer
journalctl -k --since "10 min ago" | grep -i oom

# Multiple units
journalctl -u nginx -u php-fpm -u redis

# Output formats
journalctl -u nginx -o json                    # JSON for parsing
journalctl -u nginx -o short-precise           # microsecond precision
journalctl -u nginx -o cat                     # message-only (no metadata)

# Disk usage of journal
journalctl --disk-usage

# Trim journal
sudo journalctl --vacuum-time=7d              # keep 7 days
sudo journalctl --vacuum-size=500M            # keep up to 500 MB`,
        note: "journalctl is the modern way to read logs on systemd distros. Structured (everything is queryable), persistent (survives reboot if /var/log/journal exists), unified (kernel + services + your apps in one place if they log to stdout/stderr from systemd units)."
      },
    ],
  },
  networking: {
    label: 'Networking',
    icon: '⇌',
    snippets: [
      {
        id: 'ip-ss',
        title: 'ip + ss — modern toolkit',
        desc: "Replaces ifconfig, route, netstat. Learn these; the old commands aren't installed on new distros.",
        code: `# Show interfaces + IPs
ip addr                                 # all interfaces (ip a)
ip addr show eth0                        # one interface
ip -4 addr                               # IPv4 only
ip -6 addr                               # IPv6 only

# Show routing table
ip route                                 # default + all routes
ip route get 1.1.1.1                    # what route would be used?

# Show link state
ip link
ip -s link show eth0                     # with statistics (RX/TX bytes, errors)

# Bring interface up/down
sudo ip link set eth0 up
sudo ip link set eth0 down

# Add/remove IP (temporary — won't survive reboot)
sudo ip addr add 192.168.1.100/24 dev eth0
sudo ip addr del 192.168.1.100/24 dev eth0

# Add default route
sudo ip route add default via 192.168.1.1

# ss — socket statistics (replaces netstat)
ss -tlnp                                 # TCP listening with process info
ss -tulnp                                # TCP + UDP listening
ss -tan                                  # all TCP connections
ss -tan state established                # only established
ss -tan '( dport = :443 or sport = :443 )'    # specific port

# DNS test
getent hosts example.com                 # uses NSS (proper system resolution)
dig +short example.com                   # raw DNS
resolvectl query example.com             # systemd-resolved`,
        note: "iproute2 (ip, ss, tc) replaced net-tools (ifconfig, route, netstat) over a decade ago. Many tutorials still teach the old commands; they often aren't even installed. Learn iproute2 once; never look back."
      },
      {
        id: 'tcpdump-basics',
        title: 'tcpdump — packet capture',
        desc: "When higher-level tools fail, drop to packets. tcpdump captures from any interface.",
        code: `# Capture on interface (sudo required)
sudo tcpdump -i eth0
sudo tcpdump -i any                       # all interfaces

# Quiet, no name resolution (faster)
sudo tcpdump -i eth0 -nn

# Specific host
sudo tcpdump -i eth0 host 1.1.1.1

# Specific port
sudo tcpdump -i eth0 port 443
sudo tcpdump -i eth0 'tcp port 443'
sudo tcpdump -i eth0 'tcp dst port 443'

# Combine filters (BPF syntax)
sudo tcpdump -i eth0 'host 1.1.1.1 and tcp port 443'
sudo tcpdump -i eth0 'not arp'

# Write to file (for Wireshark analysis)
sudo tcpdump -i eth0 -w capture.pcap

# Read from file
tcpdump -r capture.pcap

# Show hex + ASCII payload
sudo tcpdump -i eth0 -X port 80

# Count packets, then stop
sudo tcpdump -i eth0 -c 100 port 443

# Limit packet size (-s 0 = full, default 96 in old versions)
sudo tcpdump -i eth0 -s 0 -w full.pcap`,
        note: "BPF (Berkeley Packet Filter) syntax is its own thing — quote complex filters. For analysis, capture with tcpdump (CLI, lightweight) + analyze in Wireshark (GUI, deep dissection). On modern systems, look at tcpdump's successor candidates (ebpf-based) too — but tcpdump is everywhere."
      },
      {
        id: 'nftables-basics',
        title: 'nftables — modern firewall',
        desc: "Replaces iptables. Same kernel netfilter, cleaner syntax, more features. Default on most modern distros.",
        code: `# Show current ruleset
sudo nft list ruleset

# Add a table + chains (minimal firewall)
sudo nft add table inet filter
sudo nft 'add chain inet filter input { type filter hook input priority 0; policy drop; }'
sudo nft 'add chain inet filter output { type filter hook output priority 0; policy accept; }'

# Allow loopback
sudo nft 'add rule inet filter input iif lo accept'

# Allow established connections
sudo nft 'add rule inet filter input ct state established,related accept'

# Allow SSH (22), HTTP (80), HTTPS (443)
sudo nft 'add rule inet filter input tcp dport {22, 80, 443} accept'

# Allow ICMP (ping)
sudo nft 'add rule inet filter input icmp type echo-request accept'

# Make rules permanent
sudo nft list ruleset > /etc/nftables.conf
sudo systemctl enable nftables

# ufw (Ubuntu) — friendlier wrapper around nftables/iptables
sudo ufw allow 22/tcp
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status verbose

# firewalld (Fedora/RHEL) — zone-based wrapper
sudo firewall-cmd --add-port=80/tcp --permanent
sudo firewall-cmd --reload
sudo firewall-cmd --list-all`,
        note: "Most users don't need to touch nftables directly — ufw (Ubuntu) and firewalld (Fedora) are easier wrappers. But when those abstractions fail, you'll be reading nftables rules. iptables is being phased out, though nftables can express the same things."
      },
    ],
  },
  disk: {
    label: 'Disk & FS',
    icon: '◰',
    snippets: [
      {
        id: 'df-du',
        title: 'df + du — disk usage',
        desc: "df for filesystems, du for directories. Different views of the same disks.",
        code: `# Disk free per filesystem
df -h                                   # human-readable
df -h /                                 # just one mount point
df -i                                   # inode usage (separate from blocks)

# Disk used by directory
du -sh /var/log                          # summary, human-readable
du -h --max-depth=1 /var | sort -h       # top-level breakdown
du -sh /var/* 2>/dev/null | sort -h      # each /var/* (ignore unreadable)

# Interactive — ncdu
ncdu /                                   # navigates like a file manager
ncdu -x /                                # don't cross filesystem boundaries

# Find big files
find / -xdev -type f -size +100M 2>/dev/null
find / -xdev -type f -printf '%s %p\\n' 2>/dev/null | sort -rn | head -20

# What's holding a deleted file?
lsof +L1                                 # files with link count < 1 (deleted but open)

# inotify watches (often invisible memory consumer)
sudo find /proc/*/fd -lname anon_inode:inotify 2>/dev/null | wc -l

# Show mount points
mount | column -t
findmnt                                  # tree view
findmnt -t ext4                          # only ext4`,
        note: "df shows what kernel says is used; du sums file sizes. They can disagree (deleted files held open, snapshots, reserved blocks). When they disagree, lsof +L1 is the usual answer. ncdu is the best 'where did all my space go' tool."
      },
      {
        id: 'fstab',
        title: '/etc/fstab + mount',
        desc: "How filesystems get mounted at boot. The single file that decides what gets mounted where.",
        code: `# /etc/fstab format:
# <device>  <mountpoint>  <fstype>  <options>  <dump>  <fsck-order>

UUID=abc-123      /         ext4   defaults,noatime          0 1
UUID=def-456      /home     ext4   defaults                  0 2
UUID=ghi-789      /boot     ext4   defaults                  0 2
UUID=jkl-012      none      swap   sw                        0 0
tmpfs             /tmp      tmpfs  defaults,size=2G          0 0
192.168.1.10:/srv  /mnt/nfs  nfs    defaults,nofail,_netdev   0 0

# Find UUID of a device
sudo blkid /dev/sda1
ls -l /dev/disk/by-uuid/

# Common options:
#   defaults    rw,suid,dev,exec,auto,nouser,async
#   noatime     don't update access timestamps (faster)
#   nofail      don't block boot if missing (for removables, NFS)
#   _netdev     mount AFTER network is up
#   ro          read-only
#   user        non-root users can mount

# Test before reboot
sudo mount -a                           # mount everything in fstab
sudo systemctl daemon-reload            # rescan fstab into systemd
findmnt --verify                        # check fstab syntax

# Mount one manually
sudo mount /dev/sda1 /mnt/usb
sudo umount /mnt/usb

# Persistent mount via systemd .mount unit (alternative to fstab)
# /etc/systemd/system/mnt-data.mount`,
        note: "ALWAYS use UUID= or LABEL= in fstab, never /dev/sda1 (device names can shuffle on reboot — sda becomes sdb if a new disk is added). Test changes with `mount -a` BEFORE rebooting. A broken fstab can prevent boot — recoverable via single-user mode, but painful."
      },
    ],
  },
  perf: {
    label: 'Performance',
    icon: '⚡',
    snippets: [
      {
        id: 'top-htop',
        title: 'top + htop — process view',
        desc: "Real-time process monitoring. Both ship with most distros; htop is friendlier.",
        code: `# top — universal, no install needed
top
# Inside top:
#   P  sort by CPU
#   M  sort by memory
#   T  sort by time
#   k  kill process (asks for PID + signal)
#   1  show per-CPU stats
#   q  quit

# htop — better default for interactive use
htop
# Inside htop:
#   F2 setup, F3 search, F4 filter
#   F5 tree view (parent/child)
#   F6 sort column
#   F9 kill (with signal selection)
#   F10 quit
#   Mouse works

# Headers explained:
#   load average — 1, 5, 15 minute averages
#   Load > # cores = CPU-bound
#   CPU %: us (user) + sy (system) + wa (I/O wait) + id (idle)
#   Memory: used / cached / buffers / free
#   "Available" is the realistic free RAM (used + cached - reserved)

# Alternatives:
#   atop      historical recording — see "what was happening at 2am?"
#   glances   modern Python alternative; web mode included
#   btop      modern btop++ — fancy charts in the terminal`,
        note: "Linux mem accounting is confusing. 'free' shows little 'free' but lots 'available' — that's correct. Buffers + cache = RAM not in use, used as cache. Available = what's truly available for new work. Don't add swap because 'free' is low."
      },
      {
        id: 'iostat-vmstat',
        title: 'iostat + vmstat — system stats',
        desc: "Per-second snapshots of disk + memory + CPU. The next layer down from top.",
        code: `# iostat — disk I/O (requires sysstat package)
iostat -x 2                             # extended stats, every 2 sec
iostat -x 2 5                            # 5 samples then stop

# Columns worth knowing:
#   %util       device utilization (near 100% = saturated)
#   await       avg time per I/O request (ms) — high = slow storage
#   r/s w/s     reads/writes per second
#   rKB/s wKB/s throughput in KB
#   r_await w_await   read vs write wait times

# vmstat — system stats every N seconds
vmstat 2                                # default 5 columns, refresh every 2s
vmstat -s                                # one-shot summary

# Columns:
#   r  processes WAITING for CPU (load > # cores = problem)
#   b  processes blocked on I/O
#   swpd / si / so   swap usage / swap in / swap out (non-zero so = trouble)
#   free / buff / cache    memory states
#   us / sy / id / wa / st   user / system / idle / I/O wait / steal (VM)

# sar — historical (from sysstat)
sar -u 1 5                               # CPU, every 1s, 5 samples
sar -r 1 5                               # memory
sar -d 1 5                               # disk
sar                                       # today's archived stats (10-min samples)
sar -f /var/log/sysstat/sa15             # specific day

# Modern alternative: pidstat for per-process stats over time
pidstat -urd 2                           # CPU, mem, disk per process`,
        note: "sysstat (iostat, sar, pidstat) is the classic toolkit. Install if missing (apt install sysstat / dnf install sysstat). Enable historical recording: edit /etc/default/sysstat → ENABLED=true. Then sar reads back days of data."
      },
      {
        id: 'strace',
        title: 'strace — syscall tracing',
        desc: "What's a binary actually doing? strace shows every syscall. Slow but illuminating.",
        code: `# Trace a command from start
strace ls /tmp 2>&1 | head -30

# Trace specific syscalls
strace -e openat,read,write ls /tmp

# Attach to running process
strace -p PID
strace -fp PID                          # -f follow forks/threads

# Summary mode — counts + timing
strace -c ls /tmp                       # summary of syscall counts
# (After Ctrl+C with -p; or on command exit)

# Filter to specific syscalls
strace -e trace=network curl example.com
strace -e trace=file ls /tmp
strace -e trace=process bash -c 'echo hi'

# Write trace to file
strace -o trace.txt -ff -p PID

# Time each syscall (-T) + show timestamps (-tt)
strace -ttT -e openat ls /tmp

# Common diagnostic patterns:
#   Program hangs?         strace -p PID — see what it's stuck on
#   "Permission denied" without clarity? strace -e openat see what file
#   Network-bound?         strace -e network curl ...
#   Slow start?            strace -c — find slow syscall families`,
        note: "strace has ~5-10x performance overhead — don't leave it attached to production. Modern alternative: bpftrace + perf trace (eBPF-based, way lower overhead, programmable). But strace is everywhere; learn it. ltrace traces library calls (one level up from syscalls)."
      },
    ],
  },
  security: {
    label: 'Security',
    icon: '⛨',
    snippets: [
      {
        id: 'ssh-hardening',
        title: 'SSH hardening — /etc/ssh/sshd_config',
        desc: "First server hardening step. Disable password auth, root login, restrict to keys.",
        code: `# /etc/ssh/sshd_config — production hardening
Port 22                                  # change to non-standard for obscurity (debatable)

# Auth — keys only, no passwords
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes

# Root
PermitRootLogin no                       # never as root

# Limit who can SSH in
AllowUsers ada deploy                    # whitelist
AllowGroups ssh-users                    # or by group

# Cryptography (allow only modern algorithms)
KexAlgorithms curve25519-sha256@libssh.org,curve25519-sha256
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

# Limit attempts
MaxAuthTries 3
LoginGraceTime 30
MaxSessions 5

# Banner
Banner /etc/issue.net                    # display before login

# Forwarding (disable if not needed)
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no

# Then ALWAYS test config before reload
sudo sshd -t                             # syntax check
sudo systemctl reload sshd               # graceful reload (doesn't kill sessions)

# Generate keys (client side)
ssh-keygen -t ed25519 -C "you@example.com"
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server

# Don't reuse keys across machines; one keypair per device.
# Use ssh-agent or a tool like keychain for passphrase management.`,
        note: "ALWAYS keep a second SSH session open before editing sshd_config — test the new config (sshd -t) + open a NEW connection before closing the old. Single mistake can lock you out. fail2ban auto-bans IPs after failed attempts — install + configure even on hardened servers."
      },
      {
        id: 'sudoers',
        title: 'sudoers — granting privilege carefully',
        desc: "Edit /etc/sudoers with visudo (it checks syntax). The wrong syntax = no sudo.",
        code: `# /etc/sudoers — edit ONLY with visudo
# (visudo checks syntax before saving; direct edit can break sudo)

# Standard wheel/sudo group access (most distros default)
%wheel ALL=(ALL:ALL) ALL                 # Fedora/RHEL
%sudo  ALL=(ALL:ALL) ALL                 # Debian/Ubuntu

# Specific user, full sudo
ada ALL=(ALL:ALL) ALL

# No password for specific commands (use carefully)
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart my-app
deploy ALL=(ALL) NOPASSWD: /usr/local/bin/deploy.sh

# Run as a specific user (not root)
backup ALL=(postgres) NOPASSWD: /usr/bin/pg_dump

# Drop-in files: /etc/sudoers.d/* (preferred over editing main)
sudo visudo -f /etc/sudoers.d/deploy
# (file name: only letters, digits, hyphens — no dots)

# Audit recent sudo use
sudo journalctl _COMM=sudo --since today
grep sudo /var/log/auth.log              # Debian/Ubuntu

# Common patterns:
# - %group syntax for group membership
# - Cmnd_Alias to group commands
# - NEVER write 'ALL NOPASSWD: ALL' — that's just root with extra steps`,
        note: "visudo is the ONLY way to edit sudoers safely. It validates syntax before saving. /etc/sudoers.d/ drop-ins are better for changes — easier to manage with config tools, easier to roll back. NOPASSWD is convenient but dangerous; limit to specific commands."
      },
    ],
  },
  packages: {
    label: 'Packages',
    icon: '◧',
    snippets: [
      {
        id: 'apt-flow',
        title: 'apt — Debian/Ubuntu workflows',
        desc: "Daily-driver commands + the patterns for finding + cleaning up.",
        code: `# Refresh package metadata
sudo apt update

# Install / remove
sudo apt install package
sudo apt remove package                  # keeps config files
sudo apt purge package                   # removes config too

# Upgrade
sudo apt upgrade                          # upgrade currently-installed packages
sudo apt full-upgrade                     # may remove/install deps for upgrade
sudo apt dist-upgrade                     # legacy alias of full-upgrade

# Search + show
apt search keyword
apt show package
apt list --installed | grep nginx
apt list --upgradable

# Cleanup
sudo apt autoremove                       # remove unused dependencies
sudo apt autoclean                        # remove old downloaded .debs
sudo apt clean                            # remove all downloaded .debs

# What package owns this file?
dpkg -S /usr/bin/nginx

# What files does this package install?
dpkg -L nginx | head -20

# Reinstall (if files corrupted)
sudo apt install --reinstall nginx

# Hold a package at current version (don't upgrade)
sudo apt-mark hold linux-image-generic

# Unattended security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
# Then: /etc/apt/apt.conf.d/50unattended-upgrades configures behavior

# Repositories
ls /etc/apt/sources.list.d/              # 3rd-party repos
sudo add-apt-repository ppa:user/name    # add a PPA (Ubuntu)`,
        note: "Always 'apt update' before 'apt install' so you get the latest metadata. Don't blindly 'apt upgrade -y' on production — read changelogs. unattended-upgrades is the right way to handle security updates; configure deliberately."
      },
      {
        id: 'dnf-flow',
        title: 'dnf — Fedora/RHEL workflows',
        desc: "Same job as apt, different distro family.",
        code: `# Refresh + upgrade
sudo dnf check-update                     # show what's available
sudo dnf upgrade                          # upgrade all (auto-refresh metadata)
sudo dnf upgrade --refresh                # force metadata refresh

# Install / remove
sudo dnf install package
sudo dnf remove package
sudo dnf autoremove                       # cleanup unused deps

# Search + info
dnf search keyword
dnf info package
dnf list installed
dnf list updates

# What package owns this file?
rpm -qf /usr/bin/nginx
dnf provides /usr/bin/nginx               # works even if not installed

# What files does this package install?
rpm -ql nginx | head -20

# History — DNF tracks every transaction
dnf history                               # last 20 transactions
dnf history info 42                       # details of transaction 42
sudo dnf history undo 42                  # undo a transaction (powerful!)

# Group install (convenience meta-packages)
dnf group list
sudo dnf group install "Development Tools"

# Repositories
ls /etc/yum.repos.d/                      # repo configs
sudo dnf config-manager --add-repo URL    # add new repo
sudo dnf copr enable user/repo            # add COPR (community repos)

# Clean cache
sudo dnf clean all`,
        note: "DNF's history feature is genuinely useful — undo a problematic upgrade with one command. RHEL/Rocky/Alma also use dnf. Older RHEL 7 has yum (similar syntax, predecessor). Fedora is the rolling/fast-moving cousin of the stable enterprise distros."
      },
    ],
  },
  debug: {
    label: 'Debugging',
    icon: '⌗',
    snippets: [
      {
        id: 'lsof',
        title: 'lsof — list open files',
        desc: "What's holding this file/port open? Who has this socket? Universal Linux question.",
        code: `# Files open by a process
lsof -p PID
lsof -c nginx                           # by command name

# What's listening on port 80?
sudo lsof -i :80
sudo lsof -i tcp:80
sudo lsof -i -P -n                       # all sockets, no DNS, no service names

# Network connections
sudo lsof -i tcp                         # all TCP
sudo lsof -i @192.168.1.100              # to/from specific IP

# What's holding a deleted file open?
lsof +L1                                 # link count < 1 = deleted but open
# (You see disk full but du shows nothing? This is the answer.)

# What's using this file?
lsof /var/log/syslog                     # who has it open?

# What files does a process have open?
lsof -p PID | grep -v REG               # exclude regular files (show sockets, pipes)

# Stale NFS mounts (handles to disappeared servers)
lsof | grep -i nfs

# Combine with watch for live monitoring
watch 'lsof -p PID | head -30'`,
        note: "lsof is the 'what's holding this open?' tool. Disk fills up after you delete a big log? lsof +L1 finds the process still holding the deleted file (restart it or reboot). Port already in use? sudo lsof -i :PORT names the culprit."
      },
      {
        id: 'dmesg',
        title: 'dmesg — kernel ring buffer',
        desc: "Hardware messages, kernel warnings, OOM kills. The first place to check for hardware-adjacent issues.",
        code: `# Read kernel messages
dmesg                                    # whole ring buffer
dmesg -T                                 # human timestamps (not seconds since boot)
dmesg -w                                 # follow (like tail -f)
dmesg --level=err,warn                   # filter by priority

# Same info via journalctl (systemd unifies)
journalctl -k                            # kernel messages
journalctl -k -f                         # follow
journalctl -k --since "10 min ago"

# Common things you'll find in dmesg:
# - USB devices connecting/disconnecting
# - OOM killer activations
# - I/O errors on disks (READ FAILED, etc.)
# - Network interface link state
# - Module loading
# - Hardware initialization
# - SELinux/AppArmor denials

# Search for issues
dmesg -T | grep -i error
dmesg -T | grep -i 'killed process'      # OOM events
dmesg -T | grep -i 'i/o error'           # disk problems
dmesg -T | grep -i 'usb'                 # USB events

# Filter by facility
dmesg --facility=kern --level=warn`,
        note: "dmesg is the first stop for 'is my hardware/kernel OK?' Disk going bad? I/O errors appear here. Mysterious app death? OOM kills appear here. Network flaky? Link state changes appear here. journalctl -k gives the same info with systemd's nicer filtering."
      },
      {
        id: 'cgroup-debug',
        title: 'cgroups + namespaces — container internals',
        desc: "What containers are at the kernel level. /sys/fs/cgroup is where it all lives.",
        code: `# Show cgroups for a process
cat /proc/PID/cgroup

# systemd uses cgroups for every service — visualize
systemd-cgls                             # tree of cgroups
systemd-cgtop                             # resource usage per cgroup (live)

# cgroup v2 hierarchy lives at /sys/fs/cgroup
ls /sys/fs/cgroup/
cat /sys/fs/cgroup/system.slice/docker.service/memory.current  # current memory
cat /sys/fs/cgroup/system.slice/docker.service/memory.max      # limit

# Set limits on a systemd service
sudo systemctl set-property nginx.service MemoryMax=512M
sudo systemctl set-property nginx.service CPUQuota=50%
# These persist; check current with systemctl show nginx | grep -E 'Memory|CPU'

# Namespaces — see what a process has
ls -la /proc/PID/ns/
# pid, mnt, net, user, ipc, uts, cgroup, time

# Enter another container's namespace (debugging Docker without exec)
sudo nsenter -t CONTAINER_PID -n          # enter network namespace
sudo nsenter -t CONTAINER_PID -m          # enter mount namespace
sudo nsenter -t CONTAINER_PID -p -m -n -u  # everything

# Useful when: docker exec broken, or you want a different shell, or
# you want to run a debugging tool the container doesn't have.

# Create a new namespace (manual container)
sudo unshare --pid --fork --mount-proc bash
# Inside: ps shows only this shell as PID 1`,
        note: "Containers are 'just' processes with namespaces + cgroups. Understanding these primitives makes Docker stop feeling magical. systemd-cgls + systemd-cgtop give you the same view containers do — every systemd service is in its own cgroup."
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function LinuxAtlas() {
  const [loaded, setLoaded] = useState(false);
  const [completed, setCompleted] = useState(new Set());
  const [checklist, setChecklist] = useState({});
  const [quizState, setQuizState] = useState({});
  const [stack, setStack] = useState(null);
  const [activeSection, setActiveSection] = useState(0);

  const [copied, setCopied] = useState(null);
  const [termPopup, setTermPopup] = useState(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [archSelected, setArchSelected] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
    (async () => {
      const [c, cl, qs, st, as] = await Promise.all([
        loadKey('completed'), loadKey('checklist'), loadKey('quizState'),
        loadKey('stack'), loadKey('activeSection'),
      ]);
      if (c) setCompleted(new Set(c));
      if (cl) setChecklist(cl);
      if (qs) setQuizState(qs);
      if (st) setStack(st);
      if (typeof as === 'number') setActiveSection(as);
      if (!st) setShowOnboarding(true);
      setLoaded(true);
    })();
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  useEffect(() => { if (loaded) saveKey('completed', [...completed]); }, [completed, loaded]);
  useEffect(() => { if (loaded) saveKey('checklist', checklist); }, [checklist, loaded]);
  useEffect(() => { if (loaded) saveKey('quizState', quizState); }, [quizState, loaded]);
  useEffect(() => { if (loaded && stack) saveKey('stack', stack); }, [stack, loaded]);
  useEffect(() => { if (loaded) saveKey('activeSection', activeSection); }, [activeSection, loaded]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o); }
      if (e.key === 'Escape') { setCmdOpen(false); setTermPopup(null); setArchSelected(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };
  const toggleCheck = (id) => setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  const markComplete = (i) => setCompleted(prev => new Set([...prev, i]));
  const answerQuiz = (qid, choice, correct) => {
    setQuizState(prev => ({ ...prev, [qid]: { choice, correct: choice === correct } }));
  };

  /* ─── UI primitives ─── */
  const Code = ({ children, id, lang = 'bash' }) => (
    <div className="my-3 relative">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80">
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{lang}</span>
        <button onClick={() => copy(children, id)} className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
          {copied === id ? <Check size={12} /> : <Copy size={12} />}
          {copied === id ? 'copied' : 'copy'}
        </button>
      </div>
      <pre className="bg-zinc-950 border border-zinc-800 border-t-0 text-zinc-100 px-3 py-3 text-[13px] overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        <code>{children}</code>
      </pre>
    </div>
  );

  const Callout = ({ kind = 'info', children, title }) => {
    const p = {
      info: { border: 'border-green-400/40', bg: 'bg-green-400/5', text: 'text-green-300', label: 'NOTE' },
      warn: { border: 'border-red-400/50', bg: 'bg-red-400/5', text: 'text-red-300', label: 'GOTCHA' },
      tip: { border: 'border-amber-300/40', bg: 'bg-amber-300/5', text: 'text-amber-200', label: 'TIP' },
      you: { border: 'border-purple-300/40', bg: 'bg-purple-300/5', text: 'text-purple-200', label: 'FOR YOUR STACK' },
      cite: { border: 'border-zinc-700', bg: 'bg-zinc-900/40', text: 'text-zinc-400', label: 'CITATION' },
      dont: { border: 'border-red-500/60', bg: 'bg-red-500/10', text: 'text-red-300', label: 'DO NOT' },
    }[kind];
    return (
      <div className={`my-4 border ${p.border} ${p.bg} px-4 py-3`}>
        <div className={`text-[10px] uppercase tracking-[0.25em] ${p.text} mb-1.5 flex items-center gap-1.5`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {kind === 'cite' && <Quote size={10} />}
          {kind === 'warn' && <AlertTriangle size={10} />}
          {kind === 'dont' && <XCircle size={10} />}
          {title || p.label}
        </div>
        <div className="text-zinc-300 text-[14px] leading-relaxed">{children}</div>
      </div>
    );
  };

  const ComparisonTable = ({ data }) => (
    <div className="my-4 border border-zinc-800 overflow-x-auto">
      <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-[0.2em] text-green-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        ▤ {data.title}
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            {data.headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-zinc-500 font-normal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} className="border-b border-zinc-900 last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className={`px-3 py-2 align-top leading-relaxed ${ci === 0 ? 'text-green-400' : 'text-zinc-300'}`}
                    style={ci === 0 ? { fontFamily: 'JetBrains Mono, monospace' } : {}}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const CheckItem = ({ id, children }) => (
    <button onClick={() => toggleCheck(id)} className="flex items-start gap-3 w-full text-left py-2 hover:bg-zinc-900/50 px-2 -mx-2 transition-colors">
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-green-400 border-green-400' : 'border-zinc-600'}`}>
        {checklist[id] && <Check size={12} className="text-black" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] leading-snug ${checklist[id] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{children}</span>
    </button>
  );

  const Quiz = ({ quiz }) => {
    const state = quizState[quiz.qid];
    return (
      <div className="my-5 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-amber-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          CHECK · {quiz.qid.toUpperCase()}
        </div>
        <div className="text-zinc-100 text-[15px] mb-3 whitespace-pre-wrap">{quiz.q}</div>
        <div className="space-y-1.5">
          {quiz.opts.map((opt, i) => {
            const isChosen = state?.choice === i;
            const isCorrect = i === quiz.a;
            const reveal = !!state;
            return (
              <button key={i} onClick={() => !state && answerQuiz(quiz.qid, i, quiz.a)} disabled={!!state}
                className={`w-full text-left px-3 py-2 border text-[13px] transition-colors flex items-center gap-2 ${
                  reveal && isCorrect ? 'border-green-400 bg-green-400/10 text-green-300' :
                  reveal && isChosen && !isCorrect ? 'border-red-400 bg-red-400/10 text-red-200' :
                  'border-zinc-800 hover:border-zinc-600 text-zinc-300'
                }`}>
                <span className="text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {reveal && isCorrect && <Check size={14} className="ml-auto shrink-0" />}
                {reveal && isChosen && !isCorrect && <X size={14} className="ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
        {state && (
          <div className="mt-3 text-[13px] text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-3">{quiz.x}</div>
        )}
      </div>
    );
  };

  const Term = ({ children, name }) => {
    const key = name || (typeof children === 'string' ? children : null);
    return (
      <button onClick={() => key && setTermPopup(key)}
        className="border-b border-dotted border-green-400/60 text-green-300 hover:text-green-200 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-green-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-green-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  /* Kernel/userspace stack diagram */
  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap a layer · userspace ↓ kernel ↓ hardware
        </div>
        <svg viewBox="0 0 330 260" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="lxarr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          <line x1="165" y1="46" x2="165" y2="58" stroke="#52525b" markerEnd="url(#lxarr)" />
          <line x1="165" y1="86" x2="165" y2="98" stroke="#52525b" markerEnd="url(#lxarr)" />
          <line x1="165" y1="126" x2="165" y2="138" stroke="#52525b" markerEnd="url(#lxarr)" />
          <line x1="165" y1="166" x2="165" y2="178" stroke="#52525b" markerEnd="url(#lxarr)" />
          <line x1="165" y1="206" x2="165" y2="218" stroke="#52525b" markerEnd="url(#lxarr)" />
          {ARCH_NODES.map(n => {
            const isSel = archSelected === n.id;
            return (
              <g key={n.id} onClick={() => setArchSelected(n.id)} style={{ cursor: 'pointer' }}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h}
                  fill={isSel ? n.color + '30' : n.color + '12'} stroke={n.color}
                  strokeWidth={isSel ? '2' : '1'} />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} textAnchor="middle"
                  fill="#e4e4e7" fontSize="11"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {n.label}
                </text>
                {n.layer && (
                  <text x={n.x - 4} y={n.y + n.h / 2 + 3} textAnchor="end"
                    fill="#71717a" fontSize="8"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {n.layer}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {sel && (
          <div className="mt-2 border border-green-400/30 bg-green-400/5 p-3 text-[13px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-green-400 font-semibold">{sel.label}{sel.layer && <span className="text-zinc-500 text-[11px] ml-2">({sel.layer})</span>}</div>
              <button onClick={() => setArchSelected(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
            <div className="text-zinc-300 leading-relaxed">{sel.desc}</div>
          </div>
        )}
      </div>
    );
  };

  /* ─── SANDBOX: real mini-shell with virtual filesystem ─── */
  const Sandbox = () => {
    const [mode, setMode] = useState('challenges');
    const [challengeIdx, setChallengeIdx] = useState(0);
    const challenge = CHALLENGES[challengeIdx];

    const [cwd, setCwd] = useState('/home/ada');
    const [history, setHistory] = useState([
      { kind: 'sys', text: "Linux Atlas mini-shell · Ubuntu-flavored virtual environment" },
      { kind: 'sys', text: "Try: ls, cd, cat, pwd, find, grep, echo, wc. Type `help` for full list.\n" },
    ]);
    const [input, setInput] = useState('');
    const [cmdHistory, setCmdHistory] = useState([]);
    const [historyIdx, setHistoryIdx] = useState(-1);
    const [lastOutput, setLastOutput] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [history]);

    useEffect(() => {
      setTestResult(null);
      setShowHint(false);
    }, [challengeIdx]);

    /* ─── Path resolution + VFS access ─── */
    const resolvePath = (path) => {
      if (!path || path === '.') return cwd;
      const base = path.startsWith('/') ? '' : cwd;
      const full = (base + '/' + path).replace(/\/+/g, '/');
      const parts = full.split('/').filter(Boolean);
      const stack = [];
      for (const p of parts) {
        if (p === '..') stack.pop();
        else if (p === '~') { stack.length = 0; stack.push('home', 'ada'); }
        else if (p !== '.') stack.push(p);
      }
      const result = '/' + stack.join('/');
      return result;
    };

    const getNode = (absPath) => {
      if (absPath === '/') return VFS_ROOT;
      const parts = absPath.split('/').filter(Boolean);
      let node = VFS_ROOT;
      for (const p of parts) {
        if (node.type !== 'dir' || !node.children[p]) return null;
        node = node.children[p];
      }
      return node;
    };

    /* ─── Command implementations ─── */
    const commands = {
      help: () => `Commands available:
  pwd                    print working directory
  ls [path]              list directory contents (-l, -a, -la flags)
  cd [path]              change directory (no arg = home)
  cat FILE               display file contents
  echo TEXT              print text
  mkdir DIR              create directory (in /tmp only)
  touch FILE             create empty file (in /tmp only)
  grep PATTERN FILE      search for pattern in file
  find PATH [-name P]    search for files
  head [-n N] FILE       first N lines (default 10)
  tail [-n N] FILE       last N lines (default 10)
  wc [-l] [FILE]         word/line count
  whoami                 print user name
  uname -a               kernel info
  date                   current date/time
  env                    environment variables
  history                command history
  clear                  clear screen
  help                   this message
Pipes (|) and redirects (>, >>) are supported in a limited form.`,

      pwd: () => cwd,
      whoami: () => 'ada',
      'uname': (args) => args.includes('-a')
        ? 'Linux atlases-prod 7.0.10-generic #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'
        : 'Linux',
      date: () => new Date().toString(),
      env: () => 'HOME=/home/ada\nUSER=ada\nSHELL=/bin/bash\nPATH=/usr/local/bin:/usr/bin:/bin\nPWD=' + cwd + '\nLANG=en_US.UTF-8',
      history: () => cmdHistory.map((c, i) => `  ${(i + 1).toString().padStart(4)}  ${c}`).join('\n'),
      clear: () => { setHistory([]); return null; },

      echo: (args, raw) => {
        // strip surrounding quotes; handle $VAR limited
        const text = raw.replace(/^['"]|['"]$/g, '');
        return text.replace(/\$(\w+)/g, (m, k) => ({ HOME: '/home/ada', USER: 'ada', PWD: cwd, SHELL: '/bin/bash' }[k] ?? m));
      },

      ls: (args) => {
        let path = '.';
        let showHidden = false;
        let longFormat = false;
        for (const a of args) {
          if (a.startsWith('-')) {
            if (a.includes('a')) showHidden = true;
            if (a.includes('l')) longFormat = true;
            if (a.includes('h')) {} // human — ok
          } else { path = a; }
        }
        const absPath = resolvePath(path);
        const node = getNode(absPath);
        if (!node) return `ls: cannot access '${path}': No such file or directory`;
        if (node.type === 'file') return path;
        let entries = Object.keys(node.children);
        if (!showHidden) entries = entries.filter(n => !n.startsWith('.'));
        entries.sort();
        if (longFormat) {
          return entries.map(name => {
            const child = node.children[name];
            const isDir = child.type === 'dir';
            const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
            const size = isDir ? '4096' : String(child.content?.length ?? 0).padStart(6);
            return `${perms}  1 ada  ada  ${size}  May 25 14:00  ${name}${isDir ? '/' : ''}`;
          }).join('\n');
        }
        return entries.map(n => node.children[n].type === 'dir' ? n + '/' : n).join('  ');
      },

      cd: (args) => {
        const path = args[0] || '/home/ada';
        const target = path === '-' ? cwd : resolvePath(path);
        const node = getNode(target);
        if (!node) return `cd: ${path}: No such file or directory`;
        if (node.type !== 'dir') return `cd: ${path}: Not a directory`;
        setCwd(target);
        return null;
      },

      cat: (args) => {
        if (!args.length) return "cat: missing operand";
        const results = [];
        for (const path of args) {
          const node = getNode(resolvePath(path));
          if (!node) return `cat: ${path}: No such file or directory`;
          if (node.type !== 'file') return `cat: ${path}: Is a directory`;
          results.push(node.content);
        }
        return results.join('');
      },

      grep: (args) => {
        if (args.length < 1) return "Usage: grep PATTERN [FILE...]";
        const pattern = args[0];
        const re = new RegExp(pattern);
        const files = args.slice(1);
        if (!files.length) return "(no stdin support in this sandbox)";
        const out = [];
        for (const path of files) {
          const node = getNode(resolvePath(path));
          if (!node) { out.push(`grep: ${path}: No such file or directory`); continue; }
          if (node.type !== 'file') { out.push(`grep: ${path}: Is a directory`); continue; }
          for (const line of node.content.split('\n')) {
            if (re.test(line)) {
              out.push(files.length > 1 ? `${path}:${line}` : line);
            }
          }
        }
        return out.join('\n');
      },

      find: (args) => {
        const startPath = args[0]?.startsWith('-') ? cwd : (args[0] || cwd);
        let nameFilter = null;
        for (let i = 0; i < args.length; i++) {
          if (args[i] === '-name' && args[i + 1]) {
            nameFilter = args[i + 1].replace(/^['"]|['"]$/g, '');
          }
        }
        const matchName = (name) => {
          if (!nameFilter) return true;
          const escaped = nameFilter.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
          return new RegExp('^' + escaped + '$').test(name);
        };
        const out = [];
        const walk = (path, node) => {
          if (node.type === 'file') {
            if (matchName(path.split('/').pop())) out.push(path);
            return;
          }
          if (matchName(path.split('/').pop() || '/')) out.push(path);
          for (const [name, child] of Object.entries(node.children)) {
            walk(path === '/' ? '/' + name : path + '/' + name, child);
          }
        };
        const absStart = resolvePath(startPath);
        const start = getNode(absStart);
        if (!start) return `find: '${startPath}': No such file or directory`;
        walk(absStart, start);
        return out.join('\n');
      },

      head: (args) => {
        let n = 10;
        let file = null;
        for (let i = 0; i < args.length; i++) {
          if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[++i]); }
          else if (!args[i].startsWith('-')) file = args[i];
        }
        if (!file) return "head: missing file";
        const node = getNode(resolvePath(file));
        if (!node || node.type !== 'file') return `head: cannot open '${file}'`;
        return node.content.split('\n').slice(0, n).join('\n');
      },

      tail: (args) => {
        let n = 10;
        let file = null;
        for (let i = 0; i < args.length; i++) {
          if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[++i]); }
          else if (!args[i].startsWith('-')) file = args[i];
        }
        if (!file) return "tail: missing file";
        const node = getNode(resolvePath(file));
        if (!node || node.type !== 'file') return `tail: cannot open '${file}'`;
        const lines = node.content.split('\n');
        return lines.slice(Math.max(0, lines.length - n)).join('\n');
      },

      wc: (args, raw, stdinValue) => {
        let lineOnly = false, wordOnly = false, charOnly = false;
        const files = [];
        for (const a of args) {
          if (a === '-l') lineOnly = true;
          else if (a === '-w') wordOnly = true;
          else if (a === '-c') charOnly = true;
          else if (!a.startsWith('-')) files.push(a);
        }
        const count = (text) => {
          const lines = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
          const words = text.trim().split(/\s+/).filter(Boolean).length;
          const chars = text.length;
          if (lineOnly) return String(lines);
          if (wordOnly) return String(words);
          if (charOnly) return String(chars);
          return `${lines} ${words} ${chars}`;
        };
        if (stdinValue !== undefined) return count(stdinValue);
        if (!files.length) return "wc: no input (use file or pipe)";
        const out = [];
        for (const path of files) {
          const node = getNode(resolvePath(path));
          if (!node || node.type !== 'file') { out.push(`wc: ${path}: no such file`); continue; }
          out.push(count(node.content) + (files.length > 1 ? ' ' + path : ''));
        }
        return out.join('\n');
      },

      mkdir: (args) => {
        if (!args.length) return "mkdir: missing operand";
        return "(read-only filesystem in this sandbox)";
      },
      touch: (args) => "(read-only filesystem in this sandbox)",
      rm: (args) => "(read-only filesystem in this sandbox)",
      mv: () => "(read-only filesystem in this sandbox)",
      cp: () => "(read-only filesystem in this sandbox)",
    };

    /* ─── Command runner ─── */
    const runLine = (line) => {
      // simple pipe handling: cat X | wc -l
      const stages = line.split('|').map(s => s.trim()).filter(Boolean);
      let stdinValue;
      let out = '';
      for (let s = 0; s < stages.length; s++) {
        const stage = stages[s];
        const tokens = stage.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
        const cmdName = tokens[0];
        const argsRaw = tokens.slice(1);
        const args = argsRaw.map(a => a.replace(/^['"]|['"]$/g, ''));
        const raw = stage.slice(cmdName?.length).trim();
        const fn = commands[cmdName];
        if (!fn) { out = `${cmdName}: command not found`; break; }
        const result = fn(args, raw, stdinValue);
        if (result === null) { out = ''; break; }
        stdinValue = result;
        out = result;
      }
      return out;
    };

    const submit = (rawLine) => {
      const line = rawLine.trim();
      if (!line) { setHistory(h => [...h, { kind: 'prompt', text: '' }]); return; }
      const newHistory = [...history, { kind: 'prompt', text: line, cwd }];
      const out = runLine(line);
      if (out !== null && out !== '') {
        newHistory.push({ kind: 'out', text: out });
      }
      setHistory(newHistory);
      setCmdHistory(h => [...h, line]);
      setHistoryIdx(-1);
      setLastOutput(out || '');
      // challenge check
      if (mode === 'challenges') {
        const result = challenge.check({ lastOutput: out, cwd, line });
        setTestResult({ pass: result });
      }
    };

    const onKey = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit(input);
        setInput('');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdHistory.length) {
          const newIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
          setHistoryIdx(newIdx);
          setInput(cmdHistory[newIdx]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx === -1) return;
        const newIdx = historyIdx + 1;
        if (newIdx >= cmdHistory.length) { setHistoryIdx(-1); setInput(''); }
        else { setHistoryIdx(newIdx); setInput(cmdHistory[newIdx]); }
      }
    };

    const reset = () => {
      setCwd('/home/ada');
      setHistory([{ kind: 'sys', text: "(reset)\n" }]);
      setCmdHistory([]);
      setLastOutput('');
      setTestResult(null);
    };

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>LIVE SHELL · {mode === 'challenges' ? challenge.title : 'free play'}</span>
            <span className="text-green-400">●</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMode('challenges')} className={`text-[10px] px-2 py-0.5 border ${mode === 'challenges' ? 'border-green-400 text-green-400 bg-green-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>challenges</button>
            <button onClick={() => setMode('freeplay')} className={`text-[10px] px-2 py-0.5 border ${mode === 'freeplay' ? 'border-green-400 text-green-400 bg-green-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>free play</button>
            <button onClick={reset} className="text-[10px] px-2 py-0.5 border border-zinc-700 text-zinc-500 hover:border-amber-400 hover:text-amber-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <RotateCcw size={10} className="inline" /> reset
            </button>
          </div>
        </div>

        {mode === 'challenges' && (
          <>
            <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
              {CHALLENGES.map((c, i) => (
                <button key={c.id} onClick={() => setChallengeIdx(i)}
                  className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${i === challengeIdx ? 'border-green-400 text-green-400 bg-green-400/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {c.title.split(' · ')[0]}
                </button>
              ))}
            </div>
            <div className="px-3 py-2 border-b border-zinc-800">
              <div className="text-[13px] text-zinc-300 leading-relaxed">{challenge.desc}</div>
              {!showHint && (
                <button onClick={() => setShowHint(true)} className="mt-1 text-[11px] text-zinc-500 hover:text-amber-300 underline" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  show hint
                </button>
              )}
              {showHint && (
                <div className="mt-2 text-[11px] text-amber-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  HINT: <code>{challenge.hint}</code>
                </div>
              )}
            </div>
          </>
        )}

        <div ref={scrollRef} className="bg-black px-3 py-3 max-h-96 overflow-y-auto text-[13px] leading-snug" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {history.map((h, i) => {
            if (h.kind === 'sys') return <div key={i} className="text-zinc-500 italic whitespace-pre-wrap">{h.text}</div>;
            if (h.kind === 'prompt') return (
              <div key={i} className="text-zinc-300">
                <span className="text-green-400">ada@atlas</span>
                <span className="text-zinc-500">:</span>
                <span className="text-amber-300">{h.cwd || cwd}</span>
                <span className="text-zinc-500">$</span> {h.text}
              </div>
            );
            return <pre key={i} className="text-zinc-200 whitespace-pre-wrap">{h.text}</pre>;
          })}
          <div className="flex">
            <span className="text-green-400">ada@atlas</span>
            <span className="text-zinc-500">:</span>
            <span className="text-amber-300">{cwd}</span>
            <span className="text-zinc-500">$&nbsp;</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              autoFocus
              spellCheck={false}
              className="flex-1 bg-transparent text-zinc-100 outline-none"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
              placeholder="type a command…"
            />
          </div>
        </div>

        {testResult && (
          <div className="border-t border-zinc-800 px-3 py-2 bg-zinc-900/50">
            <div className={`text-[12px] flex items-center gap-2 ${testResult.pass ? 'text-green-400' : 'text-red-300'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {testResult.pass ? <Check size={14} /> : <X size={14} />}
              {testResult.pass ? 'CHALLENGE PASSED' : 'NOT YET — keep trying'}
            </div>
            {testResult.pass && challengeIdx < CHALLENGES.length - 1 && (
              <button onClick={() => setChallengeIdx(challengeIdx + 1)} className="mt-1 text-amber-300 hover:text-amber-100 underline text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                next challenge →
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ─── LIBRARY browser ─── */
  const LibraryViewer = () => {
    const cats = Object.keys(LIBRARY);
    const [activeCat, setActiveCat] = useState(cats[0]);
    const [expanded, setExpanded] = useState({});
    const cat = LIBRARY[activeCat];
    const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/20">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase shrink-0 pr-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Library size={12} className="inline mr-1" /> LIB
          </div>
          {cats.map(c => (
            <button key={c} onClick={() => setActiveCat(c)}
              className={`text-[11px] px-2 py-1 border whitespace-nowrap shrink-0 flex items-center gap-1 ${
                activeCat === c ? 'border-green-400 text-green-400 bg-green-400/10' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <span className="text-green-400">{LIBRARY[c].icon}</span>
              {LIBRARY[c].label}
            </button>
          ))}
        </div>
        <div className="p-3 space-y-2">
          {cat.snippets.map((s, i) => {
            const isOpen = !!expanded[s.id];
            return (
              <div key={s.id} className="border border-zinc-800">
                <button onClick={() => toggle(s.id)} className="w-full text-left px-3 py-2 hover:bg-zinc-900/60 flex items-start gap-3 transition-colors">
                  <span className="text-[10px] text-green-400 mt-1 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-100 text-[14px] font-medium" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{s.title}</div>
                    <div className="text-zinc-400 text-[12px] mt-0.5">{s.desc}</div>
                  </div>
                  <ChevronRight size={14} className={`text-zinc-500 shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-zinc-800 bg-black/60">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-900">
                      <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>bash</span>
                      <button onClick={() => copy(s.code, 'lib-' + s.id)} className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
                        {copied === 'lib-' + s.id ? <Check size={12} /> : <Copy size={12} />}
                        {copied === 'lib-' + s.id ? 'copied' : 'copy'}
                      </button>
                    </div>
                    <pre className="px-3 py-2 text-[12px] text-zinc-200 overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      <code>{s.code}</code>
                    </pre>
                    {s.note && (
                      <div className="border-t border-zinc-900 px-3 py-2 text-[12px] text-zinc-400 italic leading-relaxed">
                        <span className="text-amber-300 not-italic mr-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>NOTE</span>
                        {s.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ─── Triage tree ─── */
  const Troubleshooter = () => {
    const [path, setPath] = useState(['start']);
    const cur = TROUBLESHOOT[path[path.length - 1]];
    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-[10px] tracking-[0.25em] text-red-300 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Wrench size={12} /> TRIAGE TREE
          </div>
          {path.length > 1 && (
            <button onClick={() => setPath(['start'])} className="text-[11px] text-zinc-500 hover:text-red-300 flex items-center gap-1">
              <RotateCcw size={11} /> Start over
            </button>
          )}
        </div>
        <div className="p-4">
          {path.length > 1 && (
            <div className="flex items-center gap-1 mb-3 text-[10px] text-zinc-600 flex-wrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {path.map((p, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={10} />}
                  <span className={i === path.length - 1 ? 'text-green-400' : ''}>{p}</span>
                </span>
              ))}
            </div>
          )}
          {cur.q && (
            <>
              <div className="text-zinc-100 text-[15px] mb-3 font-medium" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{cur.q}</div>
              <div className="space-y-2">
                {cur.opts.map((opt, i) => (
                  <button key={i} onClick={() => setPath([...path, opt.next])}
                    className="w-full text-left border border-zinc-800 hover:border-red-400 hover:bg-red-400/5 px-3 py-2.5 text-[14px] text-zinc-200 transition-colors flex items-center justify-between group">
                    <span>{opt.label}</span>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-red-300" />
                  </button>
                ))}
              </div>
            </>
          )}
          {cur.fix && (
            <>
              <div className="border-l-2 border-green-400 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-green-400 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-green-400 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
          {path.length > 1 && (
            <button onClick={() => setPath(path.slice(0, -1))} className="mt-4 text-[12px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
              <ArrowLeft size={12} /> Back
            </button>
          )}
        </div>
      </div>
    );
  };

  /* ─── Exports + modals ─── */
  const exportCheatsheet = () => {
    let md = "# Linux Atlas — Cheatsheet\n\n## Permissions\n\n| Octal | Symbolic | Meaning |\n|---|---|---|\n";
    COMPARISONS.permissions.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} |\n`; });
    md += "\n## Signals\n\n| Signal | # | Catchable | Use |\n|---|---|---|---|\n";
    COMPARISONS.signals.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Distros\n\n| Distro | Family | Pkg | For |\n|---|---|---|---|\n";
    COMPARISONS.distros.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Commands\n\n```bash\n";
    COMMANDS.forEach(c => { md += `# ${c.desc}\n${c.cmd}\n\n`; });
    md += "```\n\n## Resources\n\n";
    RESOURCES.forEach(r => { md += `- **${r.name}** — ${r.url}\n  ${r.note}\n\n`; });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'linux-atlas-cheatsheet.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportLibrary = () => {
    let md = "# Linux Atlas — Library\n\n";
    Object.entries(LIBRARY).forEach(([_, cat]) => {
      md += `## ${cat.label}\n\n`;
      cat.snippets.forEach(s => { md += `### ${s.title}\n${s.desc}\n\n\`\`\`bash\n${s.code}\n\`\`\`\n\n_${s.note}_\n\n`; });
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'linux-atlas-library.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const copyAllCommands = () => {
    const all = COMMANDS.map(c => `# ${c.desc}\n${c.cmd}`).join('\n\n');
    copy(all, 'allcmds');
  };

  const allQuizzes = Object.values(QUIZZES).flat();
  const missed = allQuizzes.filter(q => quizState[q.qid] && !quizState[q.qid].correct);
  const totalAnswered = allQuizzes.filter(q => quizState[q.qid]).length;
  const totalCorrect = allQuizzes.filter(q => quizState[q.qid]?.correct).length;

  const CommandPalette = () => {
    const [q, setQ] = useState('');
    const items = [
      ...SECTIONS.map((s, i) => ({ kind: 'chapter', label: s.label, idx: i, hint: s.sub })),
      ...Object.keys(GLOSSARY).map(t => ({ kind: 'term', label: t, hint: GLOSSARY[t].slice(0, 80) + '…' })),
      ...COMMANDS.map(c => ({ kind: 'command', label: c.cmd, hint: c.desc, copy: c.cmd })),
      ...Object.entries(LIBRARY).flatMap(([_, c]) =>
        c.snippets.map(s => ({ kind: 'library', label: s.title, hint: `${c.label} · ${s.desc}` }))
      ),
    ];
    const ql = q.toLowerCase();
    const filtered = q ? items.filter(i => i.label.toLowerCase().includes(ql) || i.hint?.toLowerCase().includes(ql)) : items.slice(0, 24);
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-20" onClick={() => setCmdOpen(false)}>
        <div className="max-w-lg w-full bg-zinc-950 border border-green-400/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-green-400" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Chapters · terms · commands · library"
              className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-600 outline-none text-[14px]" />
            <kbd className="text-[10px] text-zinc-500 border border-zinc-700 px-1.5 py-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ESC</kbd>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filtered.length === 0 && <div className="px-4 py-6 text-zinc-500 text-center text-[13px]">No results.</div>}
            {filtered.map((item, i) => (
              <button key={i}
                onClick={() => {
                  if (item.kind === 'chapter') { setActiveSection(item.idx); setCmdOpen(false); }
                  else if (item.kind === 'term') { setTermPopup(item.label); setCmdOpen(false); }
                  else if (item.kind === 'command') { copy(item.copy, 'cmd-' + i); }
                  else if (item.kind === 'library') { setActiveSection(8); setCmdOpen(false); }
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-900 border-b border-zinc-900 flex items-start gap-3">
                <span className={`text-[9px] uppercase tracking-wider mt-1 shrink-0 w-16 ${
                  item.kind === 'chapter' ? 'text-green-400' :
                  item.kind === 'term' ? 'text-amber-300' :
                  item.kind === 'library' ? 'text-purple-300' : 'text-cyan-300'
                }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {item.kind}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-zinc-100 text-[13px] truncate" style={{ fontFamily: item.kind === 'command' ? 'JetBrains Mono, monospace' : 'inherit' }}>
                    {item.label}
                  </div>
                  {item.hint && <div className="text-zinc-500 text-[11px] truncate mt-0.5">{item.hint}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TermPopover = () => {
    if (!termPopup) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setTermPopup(null)}>
        <div className="max-w-md w-full bg-zinc-950 border border-green-400/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-green-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
            <button onClick={() => setTermPopup(null)} className="text-zinc-500 hover:text-zinc-200"><X size={16} /></button>
          </div>
          <div className="text-zinc-100 text-[18px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{termPopup}</div>
          <div className="text-zinc-300 text-[14px] leading-relaxed">{GLOSSARY[termPopup] || 'No definition.'}</div>
        </div>
      </div>
    );
  };

  const Onboarding = () => (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 border border-green-400/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-green-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>$ CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What's your Linux context?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples will adapt. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-green-400 hover:bg-green-400/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-green-400 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
                <div className="flex-1">
                  <div className="text-zinc-100 text-[14px] font-medium">{s.label}</div>
                  <div className="text-zinc-500 text-[12px]">{s.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const stackData = stack && PERSONALIZED[stack];
  const stackLabel = STACKS.find(s => s.id === stack)?.label;

  /* ─── Sections ─── */
  const renderSection = () => {
    switch (activeSection) {
      case 0:
        return (
          <>
            <H2 num="◇ 1991">A hobby, won't be big</H2>
            <P>
              August 25, 1991. A Finnish CS student named Linus Torvalds posted to comp.os.minix: <em>"I'm doing a (free) operating system (just a hobby, won't be big and professional like gnu) for 386(486) AT clones."</em> Kernel 0.01 followed a month later. Kernel 1.0 in March 1994. He's been wrong about the "won't be big" part for 35 years now.
            </P>
            <P>
              The kernel + GNU's pre-existing userland (Stallman's project since 1983) became GNU/Linux. Distros assembled it into shippable systems: Slackware (1993), Debian (1993), Red Hat (1994). Linux ate servers first, then mobile (Android), then containers (the whole cloud), then quietly became the substrate for almost everything that isn't macOS or Windows.
            </P>
            <H2 num="◇ 2026">The current state</H2>
            <div className="grid gap-2 my-3">
              <CheckItem id="land-kernel">Linux 7.0 released April 12, 2026 — the version-number bump from 6.x. Latest stable: 7.0.10 (May 23, 2026).</CheckItem>
              <CheckItem id="land-lts">LTS kernels still maintained: 6.18, 6.12, 6.6, 6.1, 5.15, 5.10. Most production servers ride on these.</CheckItem>
              <CheckItem id="land-rust">Rust support in the kernel is mature. New drivers increasingly written in Rust.</CheckItem>
              <CheckItem id="land-bcachefs">bcachefs is upstream — Linux's modern next-gen filesystem with native snapshots, encryption, tiered storage.</CheckItem>
              <CheckItem id="land-io_uring">io_uring is the future of high-perf async I/O — replacing epoll for new code.</CheckItem>
              <CheckItem id="land-systemd">systemd is on virtually every major distro. Love it or hate it, learn it.</CheckItem>
              <CheckItem id="land-wayland">Wayland is the default display server on Fedora, Ubuntu, GNOME. X11 is legacy.</CheckItem>
              <CheckItem id="land-containers">Containers dominate deployment. Every Docker container is a Linux process tree in namespaces + cgroups.</CheckItem>
            </div>
            <Callout kind="cite" title="THE NUMBER ONE MISCONCEPTION">
              "Linux" usually means a <strong>distribution</strong> (Ubuntu, Fedora, Arch) — not just the kernel. The kernel handles memory, scheduling, devices, networking. Everything else — shell, package manager, init system, GUI — is the distro. Same kernel, vastly different experience.
            </Callout>
            <H2 num="◇ FAMILY">Distro families</H2>
            <ComparisonTable data={COMPARISONS.distros} />
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ SHELL">The command interpreter</H2>
            <P>
              The <Term>shell</Term> reads commands, expands variables and globs, runs programs, manages I/O. <Term>Bash</Term> is the default on most distros; zsh is macOS's default + popular with power users; fish offers modern defaults; dash is fast + POSIX-strict. Scripts you write should declare which: <Kbd>#!/usr/bin/env bash</Kbd>.
            </P>
            <Code id="shell-anatomy" lang="text">{`COMMAND ANATOMY

  ls -lah /var/log
  ^  ^^^^ ^^^^^^^^
  |  |    └── arguments (paths, values)
  |  └── options/flags (single -x; long --options)
  └── command name

PIPES + REDIRECTS

  command1 | command2          stdout of cmd1 → stdin of cmd2
  command > file               stdout to file (overwrite)
  command >> file              stdout to file (append)
  command 2> errors            stderr to file
  command > out 2>&1           both stdout + stderr to out
  command < input              read stdin from file
  command1 && command2         run cmd2 only if cmd1 succeeded
  command1 || command2         run cmd2 only if cmd1 failed
  command1 ; command2          run sequentially regardless

EXPANSION

  $VAR or \${VAR}              variable substitution
  $(command)                   command substitution (modern)
  \`command\`                    command substitution (old; avoid nesting)
  ~                            home directory (current user)
  ~user                        home of specified user
  *.txt                        glob — matches files
  ?                            single-char glob
  {a,b,c}                      brace expansion — three strings`}</Code>
            <H2 num="◇ HISTORY">History + line editing</H2>
            <P>
              Bash remembers your commands (default 500-1000, configurable via HISTSIZE). Up/down arrows scroll; Ctrl+R does reverse search — type a fragment, hit Enter to run. Master these:
            </P>
            <Code id="bash-keys" lang="text">{`Ctrl+R       reverse-search history (most useful)
!!           run last command again
!$           last argument of last command
sudo !!      re-run last command with sudo
Ctrl+A       beginning of line
Ctrl+E       end of line
Ctrl+W       delete previous word
Ctrl+U       delete to start of line
Ctrl+K       delete to end of line
Ctrl+L       clear screen (same as 'clear')
Ctrl+C       cancel current command
Ctrl+Z       suspend (fg to resume)
Ctrl+D       EOF — exits shell if line is empty`}</Code>
            <Callout kind="dont" title="UNQUOTED VARIABLES">
              <Kbd>{`rm $file`}</Kbd> with <Kbd>file="my doc.txt"</Kbd> becomes <Kbd>rm my doc.txt</Kbd> — two arguments, both fail. Always quote: <Kbd>"$file"</Kbd>. Run <Kbd>shellcheck</Kbd> on every script you write — it catches this and a hundred other classics.
            </Callout>
            <Callout kind="dont" title="curl | sh FROM UNKNOWN SOURCES">
              <Kbd>curl https://random.example/install.sh | sh</Kbd> runs whatever the server sends, NOW. For known projects (rustup, nvm) it's fine. For anything else: download → audit → run.
            </Callout>
            {stackData?.shell && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.shell}</Callout>}
            {QUIZZES.shell.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ ARCH">User-space, kernel, hardware</H2>
            <P>
              Linux's structure runs top to bottom: your processes (user-space) call into libc, which calls into the kernel via <strong>syscalls</strong>, which manipulates devices via drivers. The kernel mediates everything — file access, memory allocation, network, devices. Tap a layer to expand.
            </P>
            <ArchDiagram />
            <H2 num="◇ FHS">Filesystem Hierarchy Standard</H2>
            <Code id="fhs" lang="text">{`/             root of everything
├── bin/      essential commands (ls, cp, cat) — often symlink to /usr/bin
├── boot/     kernel images, bootloader (GRUB)
├── dev/      device files (/dev/sda, /dev/null, /dev/random)
├── etc/      system-wide config files (/etc/hostname, /etc/fstab)
├── home/     user home directories (/home/ada)
├── lib/      essential libraries — often → /usr/lib
├── media/    auto-mounted removable media
├── mnt/      manual mount points
├── opt/      third-party software
├── proc/     VIRTUAL — kernel + process info as files
├── root/     home directory of root user
├── run/      runtime data (PIDs, sockets) — tmpfs (RAM-backed)
├── sbin/     system binaries (often → /usr/sbin)
├── srv/      service data (rare)
├── sys/      VIRTUAL — kernel objects + devices
├── tmp/      temp files (cleared on boot)
├── usr/      most of the OS lives here (/usr/bin, /usr/lib, /usr/share)
└── var/      variable data — logs, caches, mail, spool
    ├── log/       system logs
    ├── lib/       persistent app state (/var/lib/docker, postgresql)
    └── cache/     non-essential cache`}</Code>
            <H2 num="◇ EVERYTHING">Everything is a file</H2>
            <P>
              Linux's unifying abstraction: regular files, directories, devices, sockets, pipes, even kernel objects — all accessed through the same read/write/open/close API. Why <Kbd>cat /dev/random</Kbd> works. Why <Kbd>cat /proc/cpuinfo</Kbd> shows CPU info. Why <Kbd>echo 1 &gt; /proc/sys/net/ipv4/ip_forward</Kbd> enables IP forwarding.
            </P>
            <Code id="proc-examples">{`# /proc — kernel + process introspection (read-mostly)
cat /proc/cpuinfo           # CPU model, cores, flags
cat /proc/meminfo           # memory breakdown
cat /proc/uptime            # seconds since boot
cat /proc/loadavg           # 1/5/15-min load + running/total processes
cat /proc/version           # kernel version
ls /proc/PID/               # info about specific process
cat /proc/PID/status        # process state, PIDs, UIDs, memory
cat /proc/PID/cmdline       # full command line
ls -l /proc/PID/exe          # → the binary that's running
ls /proc/PID/fd/            # open file descriptors

# /sys — kernel objects + devices
ls /sys/class/net/                          # network interfaces
cat /sys/class/net/eth0/operstate           # up / down
cat /sys/block/sda/size                     # disk size in sectors
echo 1 > /sys/class/leds/.../brightness     # control LEDs (where supported)`}</Code>
            <H2 num="◇ LINKS">Hard links vs symbolic links</H2>
            <Code id="links" lang="text">{`# HARD LINK — another name for the same inode
ln source.txt hardlink.txt
# Both names point to the same data on disk.
# Deleting one doesn't affect the other.
# Can't cross filesystems. Can't be made for directories (mostly).

# SYMBOLIC LINK — a pointer (a file containing a path)
ln -s /path/to/target symlink
# Symlink is a tiny file with the path inside.
# Can target nonexistent files (dangles).
# Can cross filesystems. Common for /lib → /usr/lib.

# Inspect
ls -l                       # symlinks show as 'target -> source'
readlink symlink            # print the target
realpath symlink            # resolve to absolute path

# Find dangling symlinks
find /path -xtype l         # broken symlinks`}</Code>
            {QUIZZES.fs.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ PROC">What a process actually is</H2>
            <P>
              A <Term>process</Term> = a running program + its memory + open files + environment + a PID. Linux's process model is fork/exec: the shell forks (creates a copy), then exec's (replaces program with new one) in the child. Foundation of how everything runs.
            </P>
            <Code id="proc-tree" lang="text">{`PROCESS HIERARCHY

  PID 1: systemd                       (init — kernel starts this first)
   ├── PID 234: sshd                   (SSH server daemon)
   │    └── PID 1456: sshd: ada@pts/0  (your SSH session)
   │         └── PID 1457: -bash       (your shell)
   │              └── PID 1789: vim    (a process YOU started)
   ├── PID 567: nginx                  (web server)
   │    ├── PID 568: nginx: worker
   │    ├── PID 569: nginx: worker
   │    └── PID 570: nginx: worker
   └── PID 891: docker-containerd
        └── PID 2034: /usr/bin/node    (your containerized app)

ps -ef --forest                # see the tree
pstree -p                       # nicer visualization
htop                            # interactive (F5 = tree mode)`}</Code>
            <H2 num="◇ SIGNALS">Signals — async messages to processes</H2>
            <ComparisonTable data={COMPARISONS.signals} />
            <Code id="signals" lang="bash">{`# Send signals
kill PID                # default SIGTERM (15) — polite request
kill -9 PID             # SIGKILL — kernel-level, can't catch
kill -HUP PID           # SIGHUP — daemons typically reload config
kill -USR1 PID          # user-defined, app decides what to do
killall name            # by command name
pkill pattern           # regex/pattern match
pkill -f pattern        # match against full command line

# Wait politely first, escalate if needed:
kill PID                # try SIGTERM
sleep 5
kill -9 PID 2>/dev/null # SIGKILL if still alive

# Inside a script, handle signals (cleanup on exit)
trap 'rm -f /tmp/lock; echo "cleanup done"' EXIT
trap 'echo "caught SIGINT"; exit 130' INT`}</Code>
            <H2 num="◇ CGROUPS">cgroups + namespaces — container primitives</H2>
            <P>
              Containers are not VMs. They're <strong>processes with isolated views</strong>:
            </P>
            <Code id="cgroup-ns" lang="text">{`NAMESPACES — what the process can SEE
  pid     "I'm PID 1" (own process tree)
  mnt     "this is my root filesystem"
  net     "these are my network interfaces"
  user    "these are my user IDs"
  ipc     "this is my IPC space"
  uts     "this is my hostname"
  cgroup  "this is my resource view"

CGROUPS — what the process can USE
  memory  cap RAM usage
  cpu     cap CPU shares
  io      cap disk I/O
  pids    cap number of processes

systemd uses cgroups for every service.
Docker uses cgroups + all namespaces.
Kubernetes uses pods (groups of containers sharing some namespaces).

# Inspect
systemd-cgls                          # cgroup tree
systemd-cgtop                          # resource usage per cgroup, live
cat /proc/PID/cgroup                  # cgroups containing a process
ls /proc/PID/ns/                      # namespaces of a process`}</Code>
            {QUIZZES.proc.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ MODEL">The rwx model</H2>
            <P>
              Every file has an owner, a group, and three permission triples: owner (u), group (g), others (o). Each triple has read (r), write (w), execute (x). For directories: r = list, w = create/delete entries, x = traverse.
            </P>
            <ComparisonTable data={COMPARISONS.permissions} />
            <Code id="chmod" lang="bash">{`# Octal (most common)
chmod 644 file        # rw- r-- r--
chmod 755 dir         # rwx r-x r-x (standard executable/dir)
chmod 600 ~/.ssh/id_ed25519   # private key — MUST be owner-only

# Symbolic
chmod u+x script.sh   # add execute for owner
chmod g+w file        # add group write
chmod o-r secret.txt  # remove others' read
chmod a+r public.txt  # all (u+g+o)
chmod u=rw,g=r,o=     # set exactly

# Recursive
chmod -R 755 dir/     # ALL files become 755 — careful (often unwanted on files)

# Change ownership (needs root usually)
chown user file
chown user:group file
chown -R user:group dir/

# Default permissions — umask (subtracts from full perms)
umask                  # show current (usually 022)
umask 022              # files default 644, dirs 755
umask 077              # files default 600, dirs 700 (paranoid)`}</Code>
            <Callout kind="dont" title="chmod 777">
              World-writable. Any user (or compromised process) can rewrite. Almost always the wrong answer. Use 644 for files, 755 for executables/dirs, 600/700 for sensitive. <strong>If you ever feel the urge to chmod 777, stop and figure out the actual ownership/group issue.</strong>
            </Callout>
            <H2 num="◇ SUDO">sudo + capabilities</H2>
            <P>
              <Term>sudo</Term> runs commands as another user (usually root). /etc/sudoers controls who can do what. Modern best practice: never log in as root. Use a regular user; sudo specific commands.
            </P>
            <Code id="sudo">{`sudo command          # run as root
sudo -u user command  # run as different user
sudo -i               # interactive root shell (use sparingly)
sudo -l               # list what you're allowed to sudo
sudo -k               # forget cached credentials (default 15min)

# Edit sudoers SAFELY
sudo visudo                              # checks syntax before saving
sudo visudo -f /etc/sudoers.d/deploy     # drop-in (preferred)

# Common rule patterns:
%sudo ALL=(ALL:ALL) ALL                  # sudo group: full
ada ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart my-app   # one cmd, no pw

# Capabilities — finer-grained than root/non-root
# Splits root's powers into ~40 distinct capabilities
getcap /usr/bin/ping                     # ping has CAP_NET_RAW (no setuid needed)
setcap cap_net_bind_service+ep my-app    # let my-app bind port < 1024 without root`}</Code>
            {stackData?.spark && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.spark}</Callout>}
            {QUIZZES.perms.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ TOOLKIT">The networking toolkit</H2>
            <P>
              For deep networking, see the Net Atlas — DNS, TLS, HTTP, CDN, load balancers. This chapter covers what Linux-the-OS gives you for inspecting + manipulating the network stack: <Kbd>ip</Kbd>, <Kbd>ss</Kbd>, <Kbd>tcpdump</Kbd>, <Kbd>nftables</Kbd>.
            </P>
            <Code id="net-toolkit" lang="bash">{`# IP + interfaces (iproute2 — modern, replaces net-tools)
ip addr                             # show interfaces + IPs
ip route                             # routing table
ip -s link show eth0                 # link stats (errors, drops)

# Sockets (replaces netstat)
ss -tlnp                             # TCP listening with process info
ss -tan                              # all TCP connections
ss -tan state established | wc -l    # count established

# DNS testing
getent hosts example.com             # uses NSS (proper resolution chain)
dig +short example.com               # raw DNS
dig +trace example.com               # walk recursion

# Connectivity
ping 1.1.1.1                         # ICMP
mtr 1.1.1.1                          # combined ping + traceroute
traceroute example.com               # hop-by-hop path

# Packet inspection (when other tools fail)
sudo tcpdump -i eth0 -nn port 443
sudo tcpdump -i any -w capture.pcap  # save for Wireshark

# Firewall (modern: nftables)
sudo nft list ruleset
sudo ufw status                       # Ubuntu wrapper
sudo firewall-cmd --list-all          # Fedora/RHEL wrapper`}</Code>
            <Callout kind="info" title="POINTER">
              For the actual protocols + deeper coverage, see the <strong>Net Atlas</strong> (sibling chapter). This atlas focuses on Linux-side commands; the Net Atlas covers DNS / TLS / HTTP / load balancers / CDNs in depth.
            </Callout>
            {QUIZZES.net.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ INIT">PID 1: the service manager</H2>
            <P>
              <Term>systemd</Term> is the init system + service manager on virtually every major distro. It's PID 1 — the first userspace process the kernel starts. It manages everything else: services, mounts, sockets, timers, users sessions, the boot sequence.
            </P>
            <P>
              The unit-file abstraction is the core idea. A <em>unit</em> describes something systemd manages — a service, a timer, a mount point. systemd reconciles desired state with actual state.
            </P>
            <Code id="systemd-units" lang="text">{`UNIT TYPES (file extension)

  .service    a daemon or one-shot process (most common)
  .timer      time-based trigger (cron replacement)
  .socket     listening socket — start service on connection
  .mount      filesystem mount (or use /etc/fstab)
  .path       trigger service when path changes
  .target     group of units (multi-user.target = "normal boot")
  .slice      cgroup container for resource management

UNIT FILE LOCATIONS

  /lib/systemd/system/        distro-provided (don't edit)
  /etc/systemd/system/        your overrides + custom units
  ~/.config/systemd/user/     user-specific (systemctl --user)`}</Code>
            <H2 num="◇ SERVICE">A minimal service unit</H2>
            <Code id="service-min">{`# /etc/systemd/system/my-app.service
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/opt/my-app
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5s

# Hardening (free security)
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/my-app/data
PrivateTmp=true

# Logging
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target

# Then:
# sudo systemctl daemon-reload     # tell systemd about new unit
# sudo systemctl enable --now my-app
# systemctl status my-app
# journalctl -u my-app -f`}</Code>
            <H2 num="◇ CTL">The systemctl + journalctl tour</H2>
            <Code id="systemctl">{`# Service lifecycle
systemctl status nginx              # state + recent logs + exit code
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl reload nginx              # SIGHUP — reload config without restart
systemctl enable nginx              # start at boot
systemctl disable nginx             # don't start at boot
systemctl enable --now nginx        # combo: enable AND start

# Inspect
systemctl list-units                # all loaded units
systemctl list-units --type=service --state=running
systemctl list-units --failed       # failed units (start here when debugging)
systemctl list-timers               # active timers + next/last run
systemctl cat nginx                 # full unit file
systemctl show nginx                # all properties
systemctl edit nginx                # create override drop-in

# Boot analysis
systemd-analyze                     # boot time
systemd-analyze blame               # slowest services at boot
systemd-analyze critical-chain      # critical path of boot

# Journal queries
journalctl -u nginx -f              # follow logs for a service
journalctl -u nginx -n 100          # last 100 lines
journalctl -u nginx --since "1 hour ago"
journalctl -p err --since today     # errors only
journalctl -k                       # kernel ring buffer
journalctl -b                       # this boot
journalctl -b -1                    # previous boot
journalctl --disk-usage             # how much disk the journal uses
sudo journalctl --vacuum-time=7d    # trim to last 7 days`}</Code>
            <Callout kind="dont" title="WRITE A SERVICE THAT LOGS TO /var/log/myapp.log">
              Apps that write their own log files bypass journald, which is where all your other logs are. Push everything through stdout/stderr from the systemd unit — journalctl gets it, structured + queryable, alongside system logs.
            </Callout>
            {stackData?.systemd && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.systemd}</Callout>}
            {QUIZZES.systemd.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ MGRS">Package managers across distro families</H2>
            <ComparisonTable data={COMPARISONS.pkgmgrs} />
            <H2 num="◇ APT">apt — the Debian/Ubuntu workflow</H2>
            <Code id="apt-flow">{`sudo apt update                      # refresh metadata (no changes)
sudo apt install nginx               # install
sudo apt remove nginx                # remove (keep config)
sudo apt purge nginx                 # remove + config
sudo apt upgrade                     # upgrade installed packages
sudo apt full-upgrade                # may add/remove deps
sudo apt autoremove                  # cleanup unused deps

apt search keyword                   # search
apt show nginx                       # info
apt list --installed                 # installed packages
apt list --upgradable                # available upgrades

dpkg -S /usr/bin/nginx               # which package owns this file?
dpkg -L nginx                        # list files installed by nginx

# Hold a package at current version
sudo apt-mark hold nginx

# Unattended security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades`}</Code>
            <H2 num="◇ DNF">dnf — the Fedora/RHEL workflow</H2>
            <Code id="dnf-flow">{`sudo dnf check-update                # what's available
sudo dnf install nginx
sudo dnf remove nginx
sudo dnf upgrade                     # upgrade everything (auto-refreshes meta)
sudo dnf autoremove

dnf search keyword
dnf info nginx
dnf list installed
rpm -qf /usr/bin/nginx               # which package owns this file?

# DNF's killer feature — transaction history
dnf history                          # last 20 transactions
dnf history info 42                  # what changed in transaction 42
sudo dnf history undo 42             # undo a transaction (powerful)`}</Code>
            <H2 num="◇ UNIVERSAL">snap, Flatpak, AppImage</H2>
            <P>
              Three distro-agnostic packaging formats. Each bundles dependencies, sandboxes the app, and avoids "dependency hell" — at the cost of disk space + startup time.
            </P>
            <Code id="universal" lang="text">{`SNAP (Canonical) — auto-updating, sandboxed
  snap install firefox
  snap list
  snap refresh                       # update all
  Pros: works everywhere, secure sandbox
  Cons: slower startup, controversial mandatory auto-update

FLATPAK — distro-agnostic with Flathub as central repo
  flatpak install flathub org.mozilla.firefox
  flatpak list
  flatpak update
  Pros: best for desktop apps, sandboxed via portals
  Cons: large downloads (shared runtimes help)

APPIMAGE — single file, no install
  chmod +x firefox.AppImage
  ./firefox.AppImage
  Pros: portable, no system changes
  Cons: no auto-update, no central repo`}</Code>
            <Callout kind="info" title="WHEN TO USE WHICH">
              <strong>Server packages:</strong> apt / dnf (system-integrated, faster). <strong>Desktop apps:</strong> Flatpak (best sandboxing). <strong>Older/long-tail apps:</strong> AppImage (no install, easy). <strong>Avoid mixing</strong> — you'll have nginx from apt + Firefox from snap + Slack from flatpak and lose track of what gets updates from where.
            </Callout>
            {QUIZZES.pkg.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ LIB">A working library of Linux recipes</H2>
            <P>
              Eight categories — shell one-liners, systemd unit templates, networking commands, disk + fs operations, performance tooling, security hardening, package workflows, debugging cookbooks. Every snippet has copy.
            </P>
            <LibraryViewer />
            <H2 num="◇ DOWNLOAD">Take the library with you</H2>
            <button onClick={exportLibrary} className="flex items-center gap-2 border border-green-400 text-green-400 px-4 py-2 text-[13px] hover:bg-green-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <Library size={14} /> Download library.md
            </button>
            <H2 num="◇ DONT">Anti-patterns — Linux edition</H2>
            <div className="grid gap-2 my-3">
              {ANTIPATTERNS.map(a => (
                <Callout key={a.name} kind="dont" title={a.name}>{a.reason}</Callout>
              ))}
            </div>
            {stackData?.library && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.library}</Callout>}
          </>
        );

      case 9:
        return (
          <>
            <H2 num="◇ LIVE">A real mini-shell, in your browser</H2>
            <P>
              The sandbox runs a working bash-like interpreter against a virtual filesystem populated with realistic content — /home/ada/projects (sample projects: FlowFirst + PipeIQ), /etc/passwd, /var/log/syslog. Commands implemented: <Kbd>pwd</Kbd>, <Kbd>ls -la</Kbd>, <Kbd>cd</Kbd>, <Kbd>cat</Kbd>, <Kbd>echo</Kbd>, <Kbd>grep</Kbd>, <Kbd>find -name</Kbd>, <Kbd>head</Kbd>, <Kbd>tail</Kbd>, <Kbd>wc</Kbd>, <Kbd>whoami</Kbd>, <Kbd>uname -a</Kbd>, <Kbd>date</Kbd>, <Kbd>env</Kbd>, <Kbd>history</Kbd>, plus pipes (<Kbd>|</Kbd>). 8 challenges progress from <Kbd>pwd</Kbd> to chained filter-and-count.
            </P>
            <Sandbox />
            <Callout kind="tip" title="REAL LINUX PRACTICE">
              For unlimited practice: install a Linux VM (VirtualBox on Win/Mac, UTM on Mac, or WSL2 on Windows). Daily-drive it for 2-3 months. Don't use the GUI for anything you could do in the shell. The atlas teaches the map; the territory is real Linux.
            </Callout>
          </>
        );

      case 10:
        return (
          <>
            <H2 num="◇ TRIAGE">When Linux is the problem</H2>
            <P>
              Eight branches covering the most common Linux issues — disk full, runaway process, permission denied, service won't start, OOM kill, slow system, network broken, locked out. Each branch has a 5-7 step debugging flow.
            </P>
            <Troubleshooter />
            <H2 num="◇ TOOLKIT">The debugger's toolkit</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'top / htop', what: "Real-time CPU + memory + processes. htop is friendlier; both ship widely. F5 = tree mode in htop." },
                { name: 'journalctl', what: "Systemd's structured logs. -u service, -f follow, -p err filter, --since time. The primary log query tool on modern distros." },
                { name: 'dmesg', what: "Kernel ring buffer. Hardware events, OOM kills, I/O errors. Always check when something hardware-adjacent breaks." },
                { name: 'strace', what: "Syscall tracing. -p PID attach. Slow but illuminating — see exactly what a binary is doing." },
                { name: 'lsof', what: "List open files + sockets. lsof -i :port shows what's holding a port. lsof +L1 finds deleted-but-open files." },
                { name: 'sysstat (iostat, sar)', what: "Historical performance recording. sar reads back days of data. Install if missing." },
                { name: 'perf + ebpf', what: "Modern Linux performance analysis. CPU profiling, flame graphs. Brendan Gregg's writing is the gold-standard reference." },
                { name: 'brendangregg.com/linuxperf.html', what: "The definitive Linux performance toolkit reference. Bookmark." },
              ].map(t => (
                <div key={t.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-green-400 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-1 leading-relaxed">{t.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ COMMANDS">Essential commands reference</H2>
            <div className="my-3 space-y-2">
              {COMMANDS.map((c, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2 text-[12px]">
                  <code className="text-green-400 block break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.cmd}</code>
                  <div className="text-zinc-400 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={copyAllCommands} className="flex items-center gap-2 border border-amber-300 text-amber-200 px-4 py-2 text-[13px] hover:bg-amber-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
            </button>
          </>
        );

      case 11:
        return (
          <>
            <H2 num="◇ PROGRESS">Where you are</H2>
            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-green-400 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{totalCorrect}</div>
                <div className="text-zinc-500 text-[11px] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>correct</div>
              </div>
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-amber-300 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{missed.length}</div>
                <div className="text-zinc-500 text-[11px] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>missed</div>
              </div>
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-zinc-300 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{totalAnswered}/{allQuizzes.length}</div>
                <div className="text-zinc-500 text-[11px] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>answered</div>
              </div>
            </div>
            {missed.length > 0 && (
              <>
                <H2 num="◇ REVIEW">Worth a second look</H2>
                <div className="space-y-2">
                  {missed.map(q => (
                    <div key={q.qid} className="border border-zinc-800 bg-zinc-900/30 p-3 text-[13px]">
                      <div className="text-zinc-100 mb-1 whitespace-pre-wrap">{q.q}</div>
                      <div className="text-green-400 text-[12px]"><span className="text-zinc-500">Correct:</span> {q.opts[q.a]}</div>
                      <div className="text-zinc-400 text-[12px] mt-1">{q.x}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <H2 num="◇ ROADMAP">A Linux reading roadmap</H2>
            <P>
              For your stack (<strong>{stackLabel || "—"}</strong>): {stackData?.spark || "pick a stack to personalize."}
            </P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { wk: 'Week 1', plan: "Install Linux in a VM (VirtualBox/UTM/WSL2). Pick Ubuntu LTS or Fedora. Start using it daily for SOMETHING — even just terminal practice. The Linux Command Line book — read first 5 chapters." },
                { wk: 'Week 2-3', plan: "Shell muscle memory. ls, cd, cat, grep, find, pipes, redirects until you don't think. Configure ~/.bashrc. Set up ssh-keygen + ssh-copy-id. Connect to your Coolify VPS — your real environment." },
                { wk: 'Week 4-5', plan: "Permissions + filesystem. chmod, chown, /etc/passwd, /etc/group, /etc/fstab. Set up SSH keys without passwords. Write your first 3-line bash script (with set -euo pipefail + shellcheck)." },
                { wk: 'Week 6-8', plan: "systemd deep dive. Write your own service unit. Set up a timer (backup task). journalctl until you're fluent. systemctl status when things break." },
                { wk: 'Week 9-12', plan: "Networking + performance. ip, ss, tcpdump basics. top, htop, iostat. Read Brendan Gregg's perf checklist. Use strace on a real problem." },
                { wk: 'Beyond', plan: "Read RFCs that interest you. Try a different distro family for perspective (Fedora if you're on Ubuntu, vice versa). Build something self-hosted that you operate." },
              ].map(w => (
                <div key={w.wk} className="border-l-2 border-green-400 pl-3 py-1">
                  <div className="text-green-400 text-[12px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{w.wk}</div>
                  <div className="text-zinc-300 text-[12px] mt-0.5">{w.plan}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ RES">Authoritative resources</H2>
            <div className="grid gap-1.5 my-3 text-[13px]">
              {RESOURCES.map(r => (
                <div key={r.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-green-400 text-[13px] font-medium">{r.name}</span>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider px-1.5 border border-zinc-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.kind}</span>
                  </div>
                  <code className="text-amber-300 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.url}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ EXPORT">Take it with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportCheatsheet} className="flex items-center gap-2 border border-green-400 text-green-400 px-4 py-2 text-[13px] hover:bg-green-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <BookOpen size={14} /> Download cheatsheet.md
              </button>
              <button onClick={exportLibrary} className="flex items-center gap-2 border border-amber-300 text-amber-200 px-4 py-2 text-[13px] hover:bg-amber-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Library size={14} /> Download library.md
              </button>
              <button onClick={copyAllCommands} className="flex items-center gap-2 border border-purple-300 text-purple-200 px-4 py-2 text-[13px] hover:bg-purple-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
              </button>
              <button onClick={() => { if (confirm('Reset all progress?')) { setCompleted(new Set()); setChecklist({}); setQuizState({}); setStack(null); setActiveSection(0); setShowOnboarding(true); } }} className="flex items-center gap-2 border border-zinc-700 text-zinc-400 px-4 py-2 text-[13px] hover:border-red-400 hover:text-red-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <RotateCcw size={14} /> Reset progress
              </button>
            </div>
            {QUIZZES.atlas.map(q => <Quiz key={q.qid} quiz={q} />)}
            <Callout kind="info" title="THE END (AND THE BEGINNING)">
              Linux is the substrate. Your Docker containers, your Coolify VPSes, your n8n workflows, the cloud you push to — all Linux. You've walked through the kernel, shell, filesystem, processes, permissions, networking, systemd, packages, and the library + sandbox + triage tree. The intuition compounds with operation. Install a VM. Daily-drive it. Build something real.
            </Callout>
          </>
        );

      default: return null;
    }
  };

  const sec = SECTIONS[activeSection];

  return (
    <div className="min-h-screen bg-black text-zinc-300" style={{ fontFamily: 'Manrope, sans-serif' }}>
      {showOnboarding && <Onboarding />}
      {cmdOpen && <CommandPalette />}
      <TermPopover />

      <header className="border-b border-zinc-800 sticky top-0 bg-black/90 backdrop-blur-sm z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-green-400 text-[28px] leading-none font-bold shrink-0" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>#</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ATLAS</div>
              <div className="text-zinc-100 text-[16px] font-bold leading-tight truncate" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>LINUX</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {stack && (
              <button onClick={() => setShowOnboarding(true)} className="hidden sm:flex items-center gap-1.5 border border-purple-300/40 text-purple-200 px-2 py-1 text-[11px] hover:bg-purple-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {STACKS.find(s => s.id === stack)?.icon} {stackLabel}
              </button>
            )}
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-1.5 border border-zinc-700 text-zinc-400 px-2 py-1 text-[11px] hover:border-green-400 hover:text-green-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <Search size={12} /> <span className="hidden sm:inline">search</span>
              <kbd className="hidden sm:inline border border-zinc-700 px-1 text-[9px] ml-0.5">⌘K</kbd>
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-zinc-800 bg-zinc-950 sticky top-[57px] z-20">
        <div className="max-w-4xl mx-auto px-4 py-2 flex gap-1 overflow-x-auto">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === activeSection;
            const isDone = completed.has(i);
            return (
              <button key={s.id} onClick={() => setActiveSection(i)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] border transition-colors whitespace-nowrap ${
                  isActive ? 'border-green-400 bg-green-400/10 text-green-400' :
                  isDone ? 'border-zinc-700 text-zinc-400' :
                  'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="text-[9px] opacity-60">{s.num}</span>
                <Icon size={12} />
                <span>{s.label}</span>
                {isDone && <Check size={11} className="text-green-400" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-5 pb-4 border-b border-zinc-900">
          <div className="text-[10px] uppercase tracking-[0.3em] text-green-400 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            CHAPTER {sec.num}
          </div>
          <h1 className="text-zinc-100 text-[32px] font-bold leading-tight mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            {sec.label}
          </h1>
          <p className="text-zinc-500 text-[14px]">{sec.sub}</p>
        </div>

        {renderSection()}

        <div className="mt-10 pt-5 border-t border-zinc-900 flex items-center justify-between gap-2 flex-wrap">
          <button onClick={() => setActiveSection(Math.max(0, activeSection - 1))} disabled={activeSection === 0}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <ChevronLeft size={14} /> {activeSection > 0 ? SECTIONS[activeSection - 1].label : 'Start'}
          </button>
          <button onClick={() => markComplete(activeSection)} disabled={completed.has(activeSection)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-colors ${
              completed.has(activeSection) ? 'border-green-400 text-green-400 bg-green-400/10 cursor-not-allowed' :
              'border-zinc-700 text-zinc-400 hover:border-green-400 hover:text-green-400'
            }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Check size={12} /> {completed.has(activeSection) ? 'COMPLETE' : 'mark complete'}
          </button>
          <button onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))} disabled={activeSection === SECTIONS.length - 1}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {activeSection < SECTIONS.length - 1 ? SECTIONS[activeSection + 1].label : 'End'} <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-12 pb-6 text-center">
          <div className="text-zinc-700 text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            # · linux atlas · kernel 7.0 · grounded in TLCL + arch wiki + brendan gregg
          </div>
        </div>
      </main>
    </div>
  );
}
