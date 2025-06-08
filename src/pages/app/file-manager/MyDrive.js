import React, { useState, useEffect } from "react";
import { Icon, BlockTitle } from "../../../components/Component";
import { Breadcrumb, BreadcrumbItem, Button, Card } from 'reactstrap';
import Head from "../../../layout/head/Head";
import FileManagerLayout from "./components/Layout";
import * as API from '../../../utils/API';
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Handle, 
  Position, 
  useNodesState, 
  useEdgesState, 
  ReactFlowProvider, 
  useReactFlow 
} from "reactflow";
import dagre from "dagre"; // Import dagre layout
import "reactflow/dist/style.css";


let dir = 'TB'

// Layout function using Dagre
const getLayoutedElements = (nodes, edges, direction) => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction }); // Set direction (TB or LR)
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  nodes.forEach((node) => {
    const nodeWithPosition = g.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 150 / 2,  // Adjust for node width
      y: nodeWithPosition.y - 50 / 2,    // Adjust for node height
    };
  });

  return {
    nodes,
    edges,
  };
};

const customNode = ({ data }) => {

  let elem = data.label.split('_');

  function renderIcon(type) {
    if (type === 'section') {
      return <Icon name={'folders-fill'} />;
    } else if (type === 'user') {
      return <Icon name={'user-alt-fill'} />;
    } else {
      return <Icon name={'folder-fill'} />;
    }
  }

  // Dynamically set handle positions based on layoutDirection
  const topHandlePosition = dir === 'TB' ? Position.Top : Position.Left;
  const bottomHandlePosition = dir === 'TB' ? Position.Bottom : Position.Right;

  return (
    <div
      style={{
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        backgroundColor: "#fff",
        display: "flex",
        color: "#4B6382",
        alignItems: "center",
      }}
    >
      {renderIcon(elem[1])}
      <span>{elem[0]}</span>
      <Handle type="target" position={topHandlePosition} />
      <Handle type="source" position={bottomHandlePosition} />
    </div>
  );
};

let nodeTypes = {
  // customNode: (props) => <customNode {...props} layoutDirection={layoutDirection} />,  // Pass layoutDirection here,
  customNode: customNode
};

const MyDrive = () => {
  const currentSelectedModule = useSelector(state => state.folders.selectedModule);
  const [selectedModule, setSelectedModule] = useState(currentSelectedModule);
  const dispatch = useDispatch();
  const [folderStructure, setFolderStructure] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layoutDirection, setLayoutDirection] = useState('TB'); // Default to vertical ('TB')
  const [triggerFitView, setTriggerFitView] = useState(false); // State for triggering fitView

   const [reactFlowInstance, setReactFlowInstance] = useState(null);

  useEffect(() => {
    toast.remove();
    fetchData();
  }, [layoutDirection]); // Re-run when layout direction changes

  const fetchData = async () => {
    await getFolderStructure();
  };

  const getFolderStructure = async () => {
    let folderStructureResponse = await API.getMyFolderStructure();
    if (!folderStructureResponse.status) {
      return toast.error('Could Not Form Document Hierarchy');
    }

    const { nodes: generatedNodes, edges: generatedEdges } = generateNodesAndEdges(folderStructureResponse.data);
    setNodes(generatedNodes);
    setEdges(generatedEdges);
    setFolderStructure(folderStructureResponse.data);

    // Apply Dagre layout after generating nodes and edges
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(generatedNodes, generatedEdges, layoutDirection);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  const generateNodesAndEdges = (items, parent = null, xOffset = 0, yOffset = 0, level = 0) => {
    const nodeList = [];
    const edgeList = [];
    const baseX = 300; // Horizontal spacing between levels
    const baseY = 100; // Vertical spacing between siblings

    items.forEach((item, index) => {
      const id = item.value;
      const currentNode = {
        id,
        data: { label: item.label },
        position: { x: xOffset + level * baseX, y: yOffset + index * baseY },
        type: "customNode",
      };
      nodeList.push(currentNode);

      if (parent) {
        edgeList.push({ id: `${parent}-${id}`, source: parent, target: id });
      }

      if (item.children?.length) {
        const { nodes: childNodes, edges: childEdges } = generateNodesAndEdges(
          item.children,
          id,
          xOffset + level * baseX,
          yOffset + index * baseY + baseY * 2,
          level + 1
        );
        nodeList.push(...childNodes);
        edgeList.push(...childEdges);
      }
    });

    return { nodes: nodeList, edges: edgeList };
  };

  // Toggle Layout Direction
  // const toggleLayout = () => {
  //   setLayoutDirection((prevDirection) => (prevDirection === 'TB' ? 'LR' : 'TB'));
  // };

  useEffect(() => {
    // Trigger fitView when nodes or edges are updated
    if (reactFlowInstance && nodes.length > 0) {
      reactFlowInstance.fitView({ padding: 0.1 });
    }
  }, [reactFlowInstance, nodes, edges]);

  const toggleLayout = () => {
    setLayoutDirection((prevDirection) => {
      const newDirection = prevDirection === 'TB' ? 'LR' : 'TB';
      // Update the normal variable `dir`
      dir = newDirection;
      return newDirection;
    });
    // debugger
    if(reactFlowInstance){
      reactFlowInstance.fitView()
    }
  };

  console.log(layoutDirection, "layoutDirection")
  return (
    <FileManagerLayout>
      <Head title={'Folder Tree'} />
      <div style={{ padding: '1rem' }}>
        <BlockTitle page>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Breadcrumb className="breadcrumb-arrow">
              <BreadcrumbItem>
                <span className="breadcrumbforward">Folder Tree</span>
              </BreadcrumbItem>
            </Breadcrumb>
            <Button onClick={toggleLayout}>Toggle Layout</Button> {/* Button to toggle layout */}
          </div>
        </BlockTitle>

        <Card className="card-bordered">
          <div style={{ height: '100vh' }}>
            <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              nodeTypes={nodeTypes}
              onInit={setReactFlowInstance}
              fitView
            >
              <Controls />
            </ReactFlow>
            </ReactFlowProvider>
          </div>
        </Card>
      </div>
    </FileManagerLayout>
  );
};

export default MyDrive;
