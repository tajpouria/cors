#!/bin/bash
start=`date +%s`

file=$1
listening_phrase="CORS-enabled web server listening on port 8000"

# Run simple-usage-enable-all-cors-requests example server and execute associated test file to request against it
printf "Runnnig $file simple-usage-enable-all-cors-requests example server and test it\n"
timeout 30s grep -q "$listening_phrase" <(deno run --allow-net --allow-read --allow-env --unstable ./examples/$file/simple-usage-enable-all-cors-requests.ts &) || exit 1 
deno test --allow-net ./test/simple-usage-enable-all-cors-requests.test.ts
wait
kill -9 $(lsof -t -i:8000)

# Run enable-cors-for-a-single-route example server and execute associated test file to request against it
printf "Running $file enable-cors-for-a-single-route example server and test it\n"
timeout 10s grep -q "$listening_phrase" <(deno run --allow-net --allow-read --allow-env --unstable ./examples/$file/enable-cors-for-a-single-route.ts &) || exit 1 
deno test --allow-net ./test/enable-cors-for-a-single-route.test.ts
wait
kill -9 $(lsof -t -i:8000)

# Run configuring-cors example server and execute associated test file to request against it
printf "Running $file configuring-cors example server and test it\n"
timeout 10s grep -q "$listening_phrase" <(deno run --allow-net --allow-read --allow-env --unstable ./examples/$file/configuring-cors.ts &) || exit 1 
deno test --allow-net ./test/configuring-cors.test.ts
wait
kill -9 $(lsof -t -i:8000)

# Run configuring-cors-w-dynamic-origin example server and execute associated test file to request against it
printf "Running $file configuring-cors-w-dynamic-origin example server and test it\n"
timeout 10s grep -q "$listening_phrase" <(deno run --allow-net --allow-read --allow-env --unstable ./examples/$file/configuring-cors-w-dynamic-origin.ts &) || exit 1 
deno test --allow-net ./test/configuring-cors-w-dynamic-origin.test.ts
wait
kill -9 $(lsof -t -i:8000)

# Run enabling-cors-pre-flight example server and execute associated test file to request against it
printf "Running $file enabling-cors-pre-flight example server and test it\n"
timeout 10s grep -q "$listening_phrase" <(deno run --allow-net --allow-read --allow-env --unstable ./examples/$file/enabling-cors-pre-flight.ts &) || exit 1 
deno test --allow-net ./test/enabling-cors-pre-flight.test.ts
wait
kill -9 $(lsof -t -i:8000)

# Run configuring-cors-asynchronously example server and execute associated test file to request against it
printf "Running $file configuring-cors-asynchronously example server and test it\n"
timeout 10s grep -q "$listening_phrase" <(deno run --allow-net --allow-read --allow-env --unstable ./examples/$file/configuring-cors-asynchronously.ts &) || exit 1 
deno test --allow-net ./test/configuring-cors-asynchronously.test.ts
wait
kill -9 $(lsof -t -i:8000)

# Logging Stats
end=`date +%s`
runtime=$((end-start))
printf "\n"
echo "Script ran in $runtime seconds"
