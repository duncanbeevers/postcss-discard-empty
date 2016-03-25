function testRemovals (t, test, out) {
    const message = out.messages.find((m) =>
        m.plugin === 'postcss-discard-empty' && m.type === 'selectors'
    );

    const selectors = message.selectors;

    test.removedSelectors.forEach((selector) => {
        const i = selectors.indexOf(selector);

        if (i === -1) {
            t.fail('expected selector `' + selector + '` was not removed');
        } else {
            selectors.splice(i, 1);
        }
    });

    selectors.forEach((selector) => {
        t.fail('unexpected selector `' + selector + '` was removed');
    });
}

export default testRemovals;
