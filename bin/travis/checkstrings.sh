#!/usr/bin/env sh

OUTPUT=$(./bin/updatestrings.sh --dry-run)

echo "> Output from updatestrings.sh"
echo $OUTPUT

echo "> Strings check result"

ADDED_MESSAGES=$(echo "$OUTPUT" | awk '/Added Messages/ { print $3 }')
DELETED_MESSAGES=$(echo "$OUTPUT" | awk '/Deleted Messages/ { print $3 }')

RETURN=0

if test "$ADDED_MESSAGES" != "0"; then
    echo "$ADDED_MESSAGES strings are added";
    RETURN=1
fi

if test "$DELETED_MESSAGES" != "0"; then
    echo "$DELETED_MESSAGES strings are deleted";
    RETURN=1
fi

if test "$RETURN" != 0; then
    echo "Failure: strings need to be regenerated"
fi

exit $RETURN;
