import {plugin} from 'postcss';

function discardAndGather (css) {
    const selectors = [];

    function discardEmpty (node) {
        const type = node.type;
        const sub = node.nodes;

        if (sub) {
            node.each(discardEmpty);
        }

        if (
            (type === 'decl' && !node.value) ||
            (type === 'rule' && !node.selector || sub && !sub.length) ||
            (type === 'atrule' && (!sub && !node.params || !node.params && !sub.length))
        ) {
            node.remove();

            if (node.selector !== undefined) {
                selectors.push(node);
            };
        }
    }

    css.each(discardEmpty);

    return selectors;
}

export default plugin('postcss-discard-empty', () => {
    return (css, result) => {
        const discarded = discardAndGather(css);
        result.messages.push({
            type: 'selectors',
            plugin: 'postcss-discard-empty',
            selectors: discarded.map((node) => node.selector)
        });
    };
});
