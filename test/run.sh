#!/bin/bash
start=`date +%s`

# Reading file name
file=$1

# Run simple-usage-enable-all-cors-requests example server and execute associated test file to request against it
deno run --allow-net --allow-read ./examples/$file/simple-usage-enable-all-cors-requests.ts &
pid=$!
deno test --allow-net ./test/simple-usage-enable-all-cors-requests.test.ts
kill $pid
wait $pid

# Run enable-cors-for-a-single-route example server and execute associated test file to request against it
deno run --allow-net --allow-read ./examples/$file/enable-cors-for-a-single-route.ts &
pid=$!
deno test --allow-net ./test/enable-cors-for-a-single-route.test.ts
kill $pid
wait $pid

# Logging Stats
end=`date +%s`
runtime=$((end-start))
printf "\n"
echo "Script ran in $runtime seconds"
