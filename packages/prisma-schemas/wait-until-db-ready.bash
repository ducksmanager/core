SECONDS=0

while ! docker compose -f docker-compose-dev.yml logs --since 1m db | grep -q 'ready for connections'; do
    sleep 1
    ((SECONDS = SECONDS + 1))
    if [ $SECONDS -gt 10 ]; then
        exit 1
    fi
    echo 'Waiting for the DB to be up...'
done
echo 'Ready'
