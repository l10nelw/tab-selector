export async function parent(tab) {
    const { openerTabId } = tab;
    if (openerTabId) return [await getTab(openerTabId)];
}

export async function parent__descendants(tab) {
    const { openerTabId } = tab;
    if (openerTabId) {
        const tabPromises = [getTab(openerTabId), descendants(openerTabId)];
        return (await Promise.all(tabPromises)).flat();
    } else {
        return target__descendants(tab);
    }
}

export async function target__descendants(tab) {
    return [tab, ...await descendants(tab)];
}

export async function descendants(tab_or_tabId) {
    const tabId = tab_or_tabId?.id || tab_or_tabId;
    const descendantTabs = await queryTabs({ openerTabId: tabId });
    for (const tab of descendantTabs) {
        descendantTabs.push(...await descendants(tab));
    }
    return descendantTabs;
}

export async function sameHost(tab) {
    const host = (new URL(tab.url)).hostname;
    if (host) return queryTabs({ url: `*://${host}/*` });
}

export async function sameHost__descendants(tab) {
    const siteTabs = await sameHost(tab);
    if (!siteTabs) return;
    for (const tab of siteTabs) {
        siteTabs.push(...await descendants(tab));
    }
    return siteTabs;
}

const getTab = id => browser.tabs.get(id);
const queryTabs = critieria => browser.tabs.query({ ...critieria, currentWindow: true });