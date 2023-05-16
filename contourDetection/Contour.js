import { copyImage } from "../QRcodeScanner/Utils/ImageUtils.js";
import { cluster_center, findWhites, include, distance, merge } from "../QRcodeScanner/Utils/calcUtils.js"
import {image_size} from "../Consts.js"
class Contour
{
    detect_contours(image)
    {
        const width = image.width;
        const height = image.height;
        const maskedImage = new IJS.Image(width, height, {kind: 'GREY',bitDepth: 8});
        copyImage(image, maskedImage, 0, 0)
        

        // 1.find ones
        let ones = findWhites(maskedImage);
        let clusters = []
        while(ones.length > 0){
            // 1.find ones

            // 2.grab a zero as a node
            let node = ones[0];
            let queue = [node]
            let cluster = []
            while(queue.length > 0)
            {
                let node = queue[0];
                let neighbours = find_neighbours(maskedImage, node)
                cluster.push(node)
                for (let i = 0; i<neighbours.length; i++) {
                    let n = neighbours[i];
                    if (!include(queue,n) && !include(cluster,n)) {
                        queue.push(n)
                    }
                }
                queue.splice(0,1);
                maskedImage.setValueXY(node[1],node[0],0,0);
            }
            ones = findWhites(maskedImage);
            clusters.push(cluster)
            // 3.extend zero to become a cluster

            // 4. repeat 1

        }
        return clusters;
    }

    find_target_contours_center(clusters)
    {


        let centers = []
        for(let i = 0; i < clusters.length; i++)
        {
            centers.push(cluster_center(clusters[i]));
        }

        let mean_near = []
        for (let i =0; i<clusters.length; i++)
        {
            for (let j = 0; j < i; j++)
            {
                let d = distance(centers[i], centers[j]);
                if(d < 5)
                {
                    mean_near.push([i,j])
                }
            }
        }

        let merged_clusters = merge(mean_near)

        // let filtered_by_length = contour_length_filter(merged_clusters, clusters)

        let near_centers = []
        for (let n of merged_clusters)
        {
            near_centers.push(centers[n[0]])
        }

        let sorted_centers = []
        let idx = 0
        for (let i = 0; i < 4; i++)
        {
            for (let n of near_centers)
            {
                if(idx === 0 && n[0] < image_size/2 && n[1] < image_size/2)
                {
                    sorted_centers.push(n[0])
                    sorted_centers.push(n[1])
                    idx += 1
                }

                if(idx === 1 && n[0] < image_size/2 && n[1] > image_size/2)
                {
                    sorted_centers.push(n[0])
                    sorted_centers.push(n[1])
                    idx += 1
                }

                if(idx === 2 && n[0] > image_size/2 && n[1] < image_size/2)
                {
                    sorted_centers.push(n[0])
                    sorted_centers.push(n[1])
                    idx += 1
                }

                if(idx === 3 && n[0] > image_size/2 && n[1] > image_size/2)
                {
                    sorted_centers.push(n[0])
                    sorted_centers.push(n[1])
                    idx += 1
                }

            }
        }

        return sorted_centers;
    }

}


function find_neighbours(image, node)
{
    let neighbours = []
    let height = image.height;
    let width = image.width;

    if(node[0] > 0 && image.getValueXY(node[1],node[0]-1, 0) === 255)
    {
        neighbours.push([node[0]-1, node[1]])
    }
    if(node[0] < height-1 && image.getValueXY(node[1],node[0]+1,0) === 255)
    {
        neighbours.push([node[0]+1, node[1]])
    }
    if(node[1] > 0 && image.getValueXY(node[1]-1,node[0],0))
    {
        neighbours.push([node[0], node[1]-1])
    }
    if(node[1] < width-1 && image.getValueXY(node[1]+1,node[0],0) === 255)
    {
        neighbours.push([node[0],node[1] +1])
    }

    // corners
    if(node[0] > 0 && node[1] > 0 && image.getValueXY(node[1]-1,node[0]-1,0) === 255)
    {
        neighbours.push([node[0]-1,node[1]-1])
    }
    if(node[0] < height-1 && node[1] > 0 && image.getValueXY(node[1]-1,node[0]+1,0) === 255)
    {
        neighbours.push([node[0]+1,node[1]-1])
    }
    if(node[0] > 0 && node[1] < width-1 && image.getValueXY(node[1]+1,node[0]-1,0) === 255)
    {
        neighbours.push([node[0]-1,node[1]+1])
    }
    if(node[1] < height-1 && node[0] < width-1 && image.getValueXY(node[1]+1, node[0]+1,0) === 255)
    {
        neighbours.push([node[0]+1,node[1]+1])
    }
    return neighbours;
}

function contour_length_filter(merged_clusters,clusters)
{
    let filtered = []
    for (let merged of merged_clusters)
    {
        
        if(merged.length === 3)
        {
            let lengths = [clusters[merged[0]].length,clusters[merged[1]].length,clusters[merged[2]].length]
            length = lengths.sort( function( a , b){
                if(a > b) return 1;
                if(a < b) return -1;
                return 0;
            });

            if(lengths[0] > 350 && lengths[0] < 500 &&
                lengths[1] > 700 && lengths[1] < 800 &&
                lengths[2] > 900 && lengths[2] < 1100)
            {
                filtered.push(merged)
            }
        }
        if(merged.length === 2)
        {
            let lengths = [clusters[merged[0]].length,clusters[merged[1]].length]
            lengths.sort( function( a , b){
                if(a > b) return 1;
                if(a < b) return -1;
                return 0;
            });
            if(lengths[0] < 200 &&
                lengths[0] > 100 &&
                lengths[1] < 500 &&
                lengths[1] > 350)
            {
                filtered.push(merged)
            }
        }
    }

    return filtered
}
export {Contour};