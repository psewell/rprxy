module.exports = async (channel, archived) => {
  let threads = [];
  let lastID;
  while (true) {
    var fetchedThreads
    if (!archived) {
      fetchedThreads = await channel.threads.fetchActive();
    } else {
      fetchedThreads = await channel.threads.fetchArchived({
        ...(lastID && { before: lastID }),
      });
    }
    var threadValues = Array.from(fetchedThreads.threads.values());
    threads = threads.concat(threadValues);
    lastID = threadValues[threadValues.length - 1].id;
    if (!fetchedThreads.hasMore) {
      threads = threads.filter(thread =>
        thread.appliedTags.find(item => item == "1037058919899615262"));
      return threads;
    };
  };
};
