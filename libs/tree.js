import Baobab from 'baobab';

const handler = {
    get(target, name) {
        if (name === 'select') {
            return (...path) => wrapCursor(target.select(path));
        }

        return name in target
            ?
                target[name]
            :
            wrapCursor(target.select(name));
    },
};

function wrapCursor(cursor) {
    return new Proxy(cursor, handler);
}

const tree = new Baobab({});
const patchedTree = wrapCursor(tree.select());
export default patchedTree;
