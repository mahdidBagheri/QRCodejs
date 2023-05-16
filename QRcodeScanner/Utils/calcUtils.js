
function findWhites(image)
{   
    const ones = []
    const cluster = []
    for (var i =0 ; i<image.height; i++)
    {
        for (var j=0; j<image.width; j++)
        {
            if (image.getValueXY(i, j, 0) === 255)
            {
                ones.push([j, i])
            }
        }
    }
    return ones;
}

function include(ArrayOfArrays, Array)
{
    for (let i = 0; i < ArrayOfArrays.length; i++)
    {
        let isContained = true;
        for (let j = 0; j < Array.length; j++)
        {
            if(Array[j] !== ArrayOfArrays[i][j])
            {
                isContained = false;
            }
        }
        if(isContained === true)
        {
            return true;
        }
    }
    return false;
}

function cluster_center(cluster)
{
     let mean_center = [0, 0]
     let sum_center = [0, 0]
    for(let i = 0; i < cluster.length; i++)
    {
        for(let j =0; j < sum_center.length; j++)
        {
            sum_center[j] = sum_center[j] + cluster[i][j];
        }
    }
    
    for (let j = 0; j < mean_center.length; j++)
    {
        mean_center[j] = sum_center[j] / cluster.length;
    }

    return mean_center;
}

function distance(p1,p2)
{
    let d = Math.sqrt((p1[0]-p2[0])*(p1[0]-p2[0])+(p1[1]-p2[1])*(p1[1]-p2[1]));
    return d;
}

function find_non_zero_indexes(matrix)
{
    non_zero_idxs = []
    for(let i = 0; i < matrix.rows; i++)
    {
        for (let j = 0; j < matrix.columns; j++)
        {
            if(matrix[i,j] !== 0.0)
            {
                non_zero_idxs.push([i,j])
            }
        }
    }
    return non_zero_idxs;
}

function merge(array)
{
    let merged_array = []
    for (let i=0; i < array.length; i++)
    {
        let to_add = true
        for (let j=0; j < merged_array.length; j++)
        {
            let inters = intersection(array[i], merged_array[j]);
            if (inters.length !== 0)
            {

                merged_array[j] = union(array[i], merged_array[j])
                to_add = false;
                break
            }
        }
        if(to_add)
        {
            merged_array.push(array[i])   
        }
    }
    return merged_array
}

function intersection(arr1, arr2)
{

    // converting into Set
    const setA = new Set(arr1);
    const setB = new Set(arr2);

    let intersectionResult = [];

    for (let i of setB) {
    
        if (setA.has(i)) {
            intersectionResult.push(i);
        }
        
    }
    
    return intersectionResult;
}

function union(arr1,arr2)
{
    const map = {};
    const res = [];
    for (let i = arr1.length-1; i >= 0; -- i){
       map[arr1[i]] = arr1[i];
    };
    for (let i = arr2.length-1; i >= 0; -- i){
       map[arr2[i]] = arr2[i];
    };
    for (const n in map){
       if (map.hasOwnProperty(n)){
          res.push(map[n]);
       }
    }
    return res;
}

function find_transform(est_centers, dst_centers)
{
    var perspT = PerspT(est_centers, dst_centers);
    return perspT;
}



export {findWhites};
export {include};
export {cluster_center}
export {distance}
export {merge}
export {find_non_zero_indexes}
export {find_transform}