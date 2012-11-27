#!/bin/bash
if [ ! -n "$1" ]; then
    echo "Utilizzo: `basename $0` file_di_backup_dei_dati"
    exit $E_BADARGS
fi

USER=`grep username config/databases.yml|awk '{ print $2}'|head -n1`
PASS=`grep password config/databases.yml|awk '{ print $2}'|head -n1`

php symfony cc
php symfony doctrine:clean
php symfony doctrine:build --all --no-confirmation 
if [ $PASS != 'null' ]; then
    bzcat $1 |mysql -u $USER -p$PASS labber
else
    bzcat $1 |mysql -u $USER labber
fi
php symfony optimize:assets labber --env=prod
