BASEDIR="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
THEIA_LOCATION=/projects/theia

for r in packages dev-packages examples; do
    for d in ` ls $THEIA_LOCATION/$r/`; do
        directory=$THEIA_LOCATION/$r/$d
        echo linking $directory 
        cd $directory
        yarn link 
    done
done

cd $BASEDIR
echo basedir is $BASEDIR

for m in ~/.config/yarn/link/@theia/*/; do
    toLink=@theia/`basename $m`
    echo linking $toLink
    yarn link $toLink
done