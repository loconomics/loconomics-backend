#!/bin/sh

ssh-keygen -A
/usr/sbin/sshd
exec su node -c "node ."
