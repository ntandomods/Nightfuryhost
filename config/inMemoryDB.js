/**
 * In-Memory Database
 * Used when MongoDB is not available
 * Data persists only during server runtime
 */

class InMemoryDB {
  constructor() {
    this.users = new Map();
    this.hosts = new Map();
    this.coins = new Map();
    this.subscriptions = new Map();
    this.nextIds = {
      users: 1,
      hosts: 1,
      coins: 1,
      subscriptions: 1,
    };
  }

  // User operations
  createUser(userData) {
    const id = this.nextIds.users++;
    const user = { _id: id, ...userData, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  findUserById(id) {
    return this.users.get(parseInt(id));
  }

  findUserByEmail(email) {
    for (let user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  findUserByUsername(username) {
    for (let user of this.users.values()) {
      if (user.username === username) return user;
    }
    return null;
  }

  updateUser(id, data) {
    const user = this.users.get(parseInt(id));
    if (!user) return null;
    const updated = { ...user, ...data, updatedAt: new Date() };
    this.users.set(parseInt(id), updated);
    return updated;
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  // Host operations
  createHost(hostData) {
    const id = this.nextIds.hosts++;
    const host = { _id: id, ...hostData, createdAt: new Date() };
    this.hosts.set(id, host);
    return host;
  }

  findHostById(id) {
    return this.hosts.get(parseInt(id));
  }

  findHostsByUserId(userId) {
    const result = [];
    for (let host of this.hosts.values()) {
      if (host.userId === parseInt(userId)) result.push(host);
    }
    return result;
  }

  updateHost(id, data) {
    const host = this.hosts.get(parseInt(id));
    if (!host) return null;
    const updated = { ...host, ...data, updatedAt: new Date() };
    this.hosts.set(parseInt(id), updated);
    return updated;
  }

  deleteHost(id) {
    return this.hosts.delete(parseInt(id));
  }

  getAllHosts() {
    return Array.from(this.hosts.values());
  }

  // Coin operations
  createCoinTransaction(txnData) {
    const id = this.nextIds.coins++;
    const txn = { _id: id, ...txnData, createdAt: new Date() };
    this.coins.set(id, txn);
    return txn;
  }

  findCoinTransactionsByUserId(userId) {
    const result = [];
    for (let txn of this.coins.values()) {
      if (txn.userId === parseInt(userId)) result.push(txn);
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Subscription operations
  createSubscription(subData) {
    const id = this.nextIds.subscriptions++;
    const sub = { _id: id, ...subData, createdAt: new Date() };
    this.subscriptions.set(id, sub);
    return sub;
  }

  findSubscriptionByUserId(userId) {
    for (let sub of this.subscriptions.values()) {
      if (sub.userId === parseInt(userId)) return sub;
    }
    return null;
  }

  // Utility
  clear() {
    this.users.clear();
    this.hosts.clear();
    this.coins.clear();
    this.subscriptions.clear();
    this.nextIds = {
      users: 1,
      hosts: 1,
      coins: 1,
      subscriptions: 1,
    };
  }

  getStats() {
    return {
      users: this.users.size,
      hosts: this.hosts.size,
      coinTransactions: this.coins.size,
      subscriptions: this.subscriptions.size,
    };
  }
}

// Export singleton instance
module.exports = new InMemoryDB();
