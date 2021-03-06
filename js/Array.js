"use strict";

// This polyfill does NOT support IE<9 or Safari<4

// Returns true if the passed value is an array
if(!Array.isArray)
{
	Array.isArray = function isArray(val)
	{
		return Object.prototype.toString.call(val)==="[object Array]";
	};
}

// Converts the passed in value to an array. Can convert things that act "like" arrays (like HTML collections) into actual proper arrays
if(!Array.toArray)
{
	Array.toArray = function toArray(val)
	{
		if(Array.isArray(val))
			return val;

		if(Object.isObject(val) && "length" in val)
		{
			const r=[];
			for(let i=0, len=val.length;i<len;i++)
				r.push(val[i]);
			return r;
		}
	
		return [val];
	};
}

// Returns true if the array contains the same values in the same order as another array
if(!Array.prototype.equals)
{
	Array.prototype.equals = function equals(a)
	{
		if(this.length!==a.length)
			return false;
		
		for(let i=0, len=this.length;i<len;i++)
		{
			if(Array.isArray(a[i]) && Array.isArray(this[i]))
			{
				if(!a[i].equals(this[i]))
					return false;
			}
			else if(Object.isObject(a[i]) && Object.isObject(this[i]))
			{
				if(!Object.equals(a[i], this[i]))
					return false;
			}
			else if(a[i]!==this[i])
			{
				return false;
			}
		}

		return true;
	};
}

// Returns a deep copy of the array unless you pass true then you get a shallow copy
if(!Array.prototype.clone)
{
	Array.prototype.clone = function clone(shallow)
	{
		const r = [];
		for(let i=0, len=this.length;i<len;i++)
		{
			if(shallow)
				r.push(this[i]);
			else
				r.push((Array.isArray(this[i]) ? this[i].clone() : (Object.isObject(this[i]) ? Object.clone(this[i]) : this[i])));
		}

		return r;
	};
}

// Same as .filter() but does the filtering in place, returning the array itself as a result for chaining purposes
if(!Array.prototype.filterInPlace)
{
	Array.prototype.filterInPlace = function filterInPlace(cb, thisArg)
	{
		let j=0, squeezing=false;
		this.forEach((e, i) =>
		{
			if(cb.call(thisArg, e, i, this))
			{
				if(squeezing)
					this[j] = e;
				j++;
			}
			else
			{
				squeezing = true;
			}
		});

		this.length = j;

		return this;
	};
}

// Same as .map() but does the mapping in place, returning the array itself as a result for chaining purposes
if(!Array.prototype.mapInPlace)
{
	Array.prototype.mapInPlace = function mapInPlace(callback, thisArg)
	{
		this.splice(0, this.length, ...this.map(callback, thisArg));
		return this;
	};
}

// Returns an object where the keys are the values in the array and the values are the result of cb(val, i)
if(!Array.prototype.mapToObject)
{
	Array.prototype.mapToObject = function mapToObject(cb, thisArg)
	{
		const r = {};

		for(let i=0, len=this.length;i<len;i++)
			r[this[i]] = cb.call(thisArg, this[i], i);

		return r;
	};
}

// Returns true if the array contains the passed in value. Same as Array.includes() which is available in ES2016
if(!Array.prototype.contains)
{
	Array.prototype.contains = function contains(val)
	{
		return this.indexOf(val)!==-1;
	};
}

// Returns true if the array contains all of the values in the passed in array
if(!Array.prototype.containsAll)
{
	Array.prototype.containsAll = function containsAll(_vals)
	{
		const vals = Array.toArray(_vals);
		for(let i=0, len=vals.length;i<len;i++)
		{
			if(this.indexOf(vals[i])===-1)
				return false;
		}

		return true;
	};
}

// Returns true if the array contains any of the values in the passed in array
if(!Array.prototype.containsAny)
{
	Array.prototype.containsAny = function containsAny(_vals)
	{
		const vals = Array.toArray(_vals);
		for(let i=0, len=vals.length;i<len;i++)
		{
			if(this.indexOf(vals[i])!==-1)
				return true;
		}

		return false;
	};
}

// Returns how many times the passed in value occurrs in the array
if(!Array.prototype.count)
{
	Array.prototype.count = function count(val)
	{
		let r=0;
		for(let i=0, len=this.length;i<len;i++)
		{
			if(this[i]===val)
				r++;
		}

		return r;
	};
}

// Removes the first occurence of the passed in val from the array. Modifies array in place.
if(!Array.prototype.remove)
{
	Array.prototype.remove = function remove(val)
	{
		const loc = this.indexOf(val);
		if(loc===-1)
			return this;
		
		this.splice(loc, 1);

		return this;
	};
}

// Removes every occurrence of the passed in val (or array of vals) from the array. Modifies array in place.
if(!Array.prototype.removeAll)
{
	Array.prototype.removeAll = function removeAll(_vals)
	{
		Array.toArray(_vals).forEach(val =>
		{
			while(this.contains(val))
				this.remove(val);
		});

		return this;
	};
}

// Clears the array and returns itself. Modifies the array in place.
if(!Array.prototype.clear)
{
	Array.prototype.clear = function clear()
	{
		this.length = 0;

		return this;
	};
}

// Returns the sum of all the numbers in the array
if(!Array.prototype.sum)
{
	Array.prototype.sum = function sum()
	{
		if(!this.length)
			return 0;
		
		return this.reduce((p, c) => (((+p) || 0) + ((+c) || 0)));
	};
}

// Returns an average of all the numbers in the array (arithmetic mean)
if(!Array.prototype.average)
{
	Array.prototype.average = function average()
	{
		return this.sum()/this.length;
	};
}

// Returns the median of all the numbers in the array (middle number)
if(!Array.prototype.median)
{
	Array.prototype.median = function median()
	{
		const w = this.slice().sort((a, b) => a-b);
		const half = Math.floor(w.length/2);

		if(w.length % 2)
			return w[half];

		return (w[half-1] + w[half]) / 2.0;
	};
}

// On average, how far from the average is each number in our set?
// Pass true to calc a sample variance (if the data only represents a small sample of the whole of possible data)
if(!Array.prototype.variance)
{
	Array.prototype.variance = function variance(sample)
	{
		const avg = this.average();
		return (this.map(n => ((n-avg)*(n-avg))).sum() / (this.length - (sample ? 1 : 0)));
	};
}

// A better way of expressing variance. Basically how much variation exists from the average
// Pass true to use a 'sample' variance as the basis for the standard deviation
if(!Array.prototype.standardDeviation)
{
	Array.prototype.standardDeviation = function standardDeviation(sample)
	{
		return Math.sqrt(this.variance(sample));
	};
}

// Returns the lowest value in the array
if(!Array.prototype.min)
{
	Array.prototype.min = function min()
	{
		if(this.length<1)
			return;

		let r=this[0];
		for(let i=1, len=this.lenghth;i<len;i++)
			r = Math.min(r, this[i]);

		return r;
	};
}

// Returns the highest value in the array
if(!Array.prototype.max)
{
	Array.prototype.max = function max()
	{
		if(this.length<1)
			return;

		let r=this[0];
		for(let i=1, len=this.length;i<len;i++)
			r = Math.max(r, this[i]);

		return r;
	};
}

// Returns a NEW array containing just the unique items from this array
if(!Array.prototype.unique)
{
	Array.prototype.unique = function unique()
	{
		return this.filter((item, i, a) => a.indexOf(item)===i);
	};
}

// Returns a NEW array containing just the unique items from this array. Does so by sorting it first which can vastly improve speed in certain situations
if(!Array.prototype.uniqueBySort)
{
	Array.prototype.uniqueBySort = function uniqueBySort()
	{
		this.sort();

		const out = [];
		const len = this.length-1;
		if(len>=0)
		{
			for(let i=0;i<len;i++)
			{
				if(this[i]!==this[i+1])
					out.push(this[i]);
			}

			out.push(this[len]);
		}

		return out;
	};
}

// Push all the values in the array passed in onto the array. This differs from .concat() in that it doesn't create a new array but just pushes onto the existing array
// This method is useful over .push(...vals) because it returns the array for chaining
if(!Array.prototype.pushAll)
{
	Array.prototype.pushAll = function pushAll(vals)
	{
		this.push(...vals);
		return this;
	};
}

// Pushes the passed in values onto the array, but only if they are not already present within the array
if(!Array.prototype.pushUnique)
{
	Array.prototype.pushUnique = function pushUnique(...vals)
	{
		for(let i=0, len=vals.length;i<len;i++)
		{
			if(this.indexOf(vals[i])===-1)
				this.push(vals[i]);
		}

		return this;
	};
}

// Pushes a sequence of numbers onto the end of an array
if(!Array.prototype.pushSequence)
{
	Array.prototype.pushSequence = function pushSequence(startAt, endAt)
	{
		if(endAt>startAt)
		{
			for(let i=startAt;i<=endAt;i++)
				this.push(i);
		}
		else if(endAt<startAt)
		{
			for(let i=startAt;i>=endAt;i--)
				this.push(i);
		}
		else
		{
			this.push(startAt);
		}

		return this;
	};
}

// Pushs the given val onto the array x times
if(!Array.prototype.pushMany)
{
	Array.prototype.pushMany = function pushMany(val, _x)
	{
		let x = _x;
		while((x--)>0)
			this.push((Array.isArray(val) ? val.clone() : (Object.isObject(val) ? Object.clone(val) : val)));

		return this;
	};
}

// Pushes copies of itself x times. A similar effect can be achieved with the new ES2015 .copyWithin() method
if(!Array.prototype.pushCopyInPlace)
{
	Array.prototype.pushCopyInPlace = function pushCopyInPlace(_x)
	{
		const x = (_x || 1);
		const copy = this.slice();
		for(let i=0;i<x;i++)
			this.push(...copy);

		return this;
	};
}

// Pulls the first occurence of a value out of an array, modifying the array.
if(!Array.prototype.pull)
{
	Array.prototype.pull = function pull(val)
	{
		const loc = this.indexOf(val);
		if(loc===-1)
			return undefined;
		
		return this.splice(loc, 1)[0];
	};
}

// Pulls all the values in the passed in array from the base array, modifying it.
if(!Array.prototype.pullAll)
{
	Array.prototype.pullAll = function pullAll(_vals)
	{
		const vals = Array.toArray(_vals);
		const results=[];
		
		vals.forEach(val =>
		{
			let r = undefined;
			do
			{
				r = this.pull(val);
				if(typeof r!=="undefined")
					results.push(r);
			} while(r);
		});
		
		return results;
	};
}

// Returns the last element of the array
if(!Array.prototype.last)
{
	Array.prototype.last = function last()
	{
		return this[this.length-1];
	};
}

// Returns a NEW Array containing all the elements of the base array after except for the values passed in
if(!Array.prototype.subtract)
{
	Array.prototype.subtract = function subtract(vals)
	{
		const r = this.slice();
		vals.forEach(v => r.remove(v));
		return r;
	};
}

// Returns a NEW array with any "empty" elements removed. Any element that has "falsy" truthiness is removed.
if(!Array.prototype.filterEmpty)
{
	Array.prototype.filterEmpty = function filterEmpty()
	{
		return this.filter(a => !!a);
	};
}

// Flattens an array
if(!Array.prototype.flatten)
{
	Array.prototype.flatten = function flatten(_depth)
	{
		let depth = typeof _depth==="undefined" ? 1 : _depth;
		return this.reduce((a, v) => (Array.isArray(v) && depth>0 ? a.concat(v.flatten((--depth))) : a.concat(v)), []);
	};
}

// Replaces a particular value at index idx, returning the array for chaining
if(!Array.prototype.replaceAt)
{
	Array.prototype.replaceAt = function replaceAt(idx, v)
	{
		this[idx] = v;
		return this;
	};
}

// Reduce the array just like .reduce() but only once. Stopping once you return a non-null/non-undefined result
if(!Array.prototype.reduceOnce)
{
	Array.prototype.reduceOnce = function reduceOnce(cb)
	{
		return this.reduce((r, ...args) =>
		{
			if(r!==null)
				return r;

			const cbRes = cb(...args);
			return (typeof cbRes==="undefined" ? null : cbRes);
		}, null);
	};
}

// Replaces all values in the array that match oldVal with newVal
if(!Array.prototype.replaceAll)
{
	Array.prototype.replaceAll = function replaceAll(oldVal, newVal)
	{
		if(oldVal===newVal)
			return this;
		
		do
		{
			const loc = this.indexOf(oldVal);
			if(loc===-1)
				break;

			this.splice(loc, 1, newVal);
		} while(true);
		
		return this;
	};
}

// Sorts an array based on the values returned by the sorter cb functions passed in. reverse can be `true` or an array of booleans corresponding to each sorter cb
if(!Array.prototype.multiSort)
{
	Array.prototype.multiSort = function multiSort(_sorters, reverse)
	{
		const sorters = Array.toArray(_sorters).filterEmpty();
		if(sorters.length===0)
			sorters.push(v => v);

		this.sort((a, b) =>
		{
			for(let i=0, len=sorters.length;i<len;i++)
			{
				const sorter = sorters[i];

				const aVal = sorter(a);
				const bVal = sorter(b);

				if(typeof aVal==="string")
				{
					const stringCompareResult = aVal.localeCompare(bVal);
					if(stringCompareResult<0)
						return (reverse && (!Array.isArray(reverse) || reverse[i]) ? 1 : -1);

					if(stringCompareResult>0)
						return (reverse && (!Array.isArray(reverse) || reverse[i]) ? -1 : 1);
				}
				else
				{
					if(aVal<bVal)
						return (reverse && (!Array.isArray(reverse) || reverse[i]) ? 1 : -1);

					if(aVal>bVal)
						return (reverse && (!Array.isArray(reverse) || reverse[i]) ? -1 : 1);
				}
			}

			return 0;
		});

		return this;
	};
}

// Returns a random value from the array. If only 1 item requested, it returns that item, otherwise it returns an array of values
// Can pass an excluded value or array of excluded values
if(!Array.prototype.pickRandom)
{
	Array.prototype.pickRandom = function pickRandom(num=1, _excludedItems=[])
	{
		const excludedItems = Array.toArray(_excludedItems);

		if(excludedItems.length===0)
		{
			// Saves time and just picks 1 at random
			if(num===1)
				return this[Math.floor(Math.random()*this.length)];

			// If we want all our elements, just shuffle em up and return em
			if(num>=this.length)
				return this.slice().shuffle();
		}

		const excludedIndexes=[];
		if(excludedItems.length>0)
		{
			excludedItems.forEach(excludedItem =>
			{
				const excludedItemIndex = this.indexOf(excludedItem);
				if(excludedItemIndex!==-1)
					excludedIndexes.push(excludedItemIndex);
			});
		}

		const pickedIndexes=[];
		for(let i=0;i<num;i++)
			pickedIndexes.push(Math.randomIntExcluding(0, (this.length-1), pickedIndexes.concat(excludedIndexes)));

		const r = pickedIndexes.map(pickedIndex => this[pickedIndex]);
		return (num===1 ? r[0] : r);
	};
}

// Shuffles an array of numbers. Correctly.
if(!Array.prototype.shuffle)
{
	Array.prototype.shuffle = function shuffle()
	{
		let m=this.length, t=null, i=0;
		while(m)
		{
			i = Math.randomInt(0, --m);
			t = this[m];
			this[m] = this[i];
			this[i] = t;
		}

		return this;
	};
}

// Returns the first value that the cb returns a truthy value for
// I OVERWRITE the Array.prototype.find() always because stupid Internet Explorer has a non-standard bad version of this method
Array.prototype.find = function find(cb)
{
	for(let i=0, len=this.length;i<len;i++)
	{
		if(cb(this[i], i, this))
			return this[i];
	}

	return undefined;
};

// Rotates the array elements by x places
if(!Array.prototype.rotate)
{
	Array.prototype.rotate = function rotate(x)
	{
		this.unshift.apply(this, this.splice(x, this.length));	// eslint-disable-line prefer-spread
		return this;
	};
}

/* // Alternative rotate implementation
Array.prototype.rotate = function rotate(x)
{
	var len = this.length >>> 0,
	x = x >> 0;

	Array.prototype.unshift.apply(this, Array.prototype.splice.call(this, x % len, len));
	return this;
};*/

// Batches up the values in the array into sub arrays of x length
if(!Array.prototype.batch)
{
	Array.prototype.batch = function batch(x=1)
	{
		const batches = [];
		while(this.length>0)
			batches.push(this.splice(0, x));

		return batches;
	};
}

(function _arrayAsyncFuncs()
{
	function CBRunner(_fun, _val, _i, _finish)
	{
		this.fun = _fun;
		this.val = _val;
		this.i = _i;
		this.finish = _finish;

		CBRunner.prototype.run = function run(delay)
		{
			if(delay)
				setTimeout(this.runActual.bind(this), delay);
			else
				this.runActual();
		};

		CBRunner.prototype.runActual = function runActual()
		{
			this.fun(this.val, (err, result) => this.finish(err, result, this.i), this.i);
		};
	}

	function CBIterator(_a, _fun, _atOnce, _minInterval)
	{
		this.a = _a.slice();
		this.fun = _fun;
		this.atOnce = _atOnce || 1;
		this.results = [];
		this.i=0;
		this.running=[];
		this.minInterval = _minInterval || 0;
		this.intervalDelay=0;

		CBIterator.prototype.go = function go(cb)
		{
			this.cb = cb || function _cb() {};
			if(this.a.length<1)
				return this.cb(undefined, []);

			this.next();
		};

		CBIterator.prototype.next = function next()
		{
			const toRun = [];
			while(this.running.length<this.atOnce && this.a.length>0)
			{
				const curi = this.i++;
				this.running.push(curi);
				toRun.push(new CBRunner(this.fun, this.a.shift(), curi, this.finish.bind(this)));
			}

			while(toRun.length)
			{
				if(this.intervalDelay<this.atOnce)
					this.intervalDelay++;

				toRun.shift().run(this.intervalDelay*this.minInterval);
			}
		};

		CBIterator.prototype.finish = function finish(err, result, curi)
		{
			this.intervalDelay--;
			
			if(err)
				return this.cb(err, this.results);

			this.results[curi] = result;
			this.running.remove(curi);

			if(this.running.length===0 && this.a.length===0)
				return this.cb(undefined, this.results);

			this.next();
		};
	}

	if(!Array.prototype.serialForEach)
	{
		Array.prototype.serialForEach = function parallelForEach(fun, cb)
		{
			(new CBIterator(this, fun, 1)).go(cb);
		};
	}

	if(!Array.prototype.parallelForEach)
	{
		Array.prototype.parallelForEach = function parallelForEach(fun, cb, atOnce, minInterval)
		{
			(new CBIterator(this, fun, atOnce||5, minInterval||0)).go(cb);
		};
	}
})();
