FROM ubuntu:18.04 as base

ENV DEBIAN_FRONTEND=noninteractive TERM=xterm
RUN echo "export > /etc/envvars" >> /root/.bashrc && \
    echo "export PS1='\[\e[1;31m\]\u@\h:\w\\$\[\e[0m\] '" | tee -a /root/.bashrc /etc/skel/.bashrc && \
    echo "alias tcurrent='tail /var/log/*/current -f'" | tee -a /root/.bashrc /etc/skel/.bashrc

RUN apt-get update
RUN apt-get install -y locales && locale-gen en_US.UTF-8 && dpkg-reconfigure locales
ENV LANGUAGE=en_US.UTF-8 LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8

# Utilities
RUN apt-get install -y --no-install-recommends vim less net-tools inetutils-ping wget curl git telnet nmap socat dnsutils netcat tree htop unzip sudo software-properties-common jq psmisc iproute2 python ssh rsync gettext-base

# Java
RUN apt-get --yes install default-jdk

FROM base as tools

RUN apt-get update
RUN apt-get install -y build-essential --fix-missing

# SBT
RUN curl -L -o sbt.deb http://dl.bintray.com/sbt/debian/sbt-1.2.6.deb && \
    dpkg -i sbt.deb

# NodeJS
RUN wget -O - https://nodejs.org/dist/v10.10.0/node-v10.10.0-linux-x64.tar.gz | tar xz && \
    mv node* node
ENV PATH $PATH:/node/bin
ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

# Cache
FROM tools as cache
COPY project /src/project
RUN cd /src && \
    sbt update
COPY package*.json /src/
RUN cd /src && \
    npm  --unsafe-perm install

COPY . /src/

# sbt build
FROM cache as build_sbt

RUN cd /src && \
    sbt clean && \
    sbt fullOptJS

# npm build
FROM build_sbt as build_npm

RUN cd /src && \
    npm  --unsafe-perm install && \
    npm  --unsafe-perm run build_prod

FROM build_npm as test

# Re-enable once tests are working again
# RUN cd /src && \
   # SBT_OPTS="-Xmx4G" sbt test


