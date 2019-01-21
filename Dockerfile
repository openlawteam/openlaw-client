FROM pritunl/archlinux
RUN pacman -S solidity jdk11-openjdk sbt npm --noconfirm
RUN sbt clean
RUN sbt fullOptJS
RUN npm run build_prod

# Re-enable tests once they are working again
# Run sbt test 
