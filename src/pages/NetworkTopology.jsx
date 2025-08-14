import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { getDevices } from '../redux/slices/deviceSlice';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  ServerIcon,
  CubeTransparentIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  CommandLineIcon,
  BeakerIcon,
  CheckCircleIcon,
  XMarkIcon,
  Cog6ToothIcon,
  BookmarkIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  TrashIcon,
  SparklesIcon,
  DeviceTabletIcon,
  XCircleIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

// Enhanced Custom Node Component
const DeviceNode = ({ data, selected }) => {
  const { t } = useTranslation();
  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'router':
        return <CubeTransparentIcon className="h-8 w-8 text-blue-600" />;
      case 'switch':
        return <CircleStackIcon className="h-8 w-8 text-purple-600" />;
      case 'server':
        return <ServerIcon className="h-8 w-8 text-green-600" />;
      case 'firewall':
        return <ShieldCheckIcon className="h-8 w-8 text-red-600" />;
      case 'load_balancer':
        return <BeakerIcon className="h-8 w-8 text-yellow-600" />;
      default:
        return <ServerIcon className="h-8 w-8 text-gray-600" />;
    }
  };

  // Check if this is the central Diskominfo router
  const isCentralRouter = data.name?.toLowerCase().includes('diskominfo') || data.role === 'central';
  const isServer = data.type?.toLowerCase() === 'server';

  const getNodeStyle = () => {
    if (selected) {
      return 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-blue-300 dark:shadow-blue-900/50 scale-110';
    }
    if (isCentralRouter) {
      return 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 shadow-yellow-300 dark:shadow-yellow-900/50';
    }
    if (isServer) {
      return 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 shadow-green-300 dark:shadow-green-900/50';
    }
    
    const isUp = data.status?.toUpperCase() === 'UP';
    return isUp 
      ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 shadow-emerald-200 dark:shadow-emerald-900/50'
      : 'border-red-400 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 shadow-red-200 dark:shadow-red-900/50';
  };

  const isUp = data.status?.toUpperCase() === 'UP';

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.05 }}
      className={`relative p-6 rounded-2xl border-3 shadow-2xl transition-all duration-300 cursor-pointer backdrop-blur-sm ${getNodeStyle()}`}
    >
      {/* Animated status indicator */}
      <div className="absolute -top-2 -right-2 flex items-center justify-center">
        <div className={`w-5 h-5 rounded-full border-3 border-white dark:border-gray-800 ${
          isUp ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {isUp && (
            <div className="absolute inset-0 w-5 h-5 bg-green-400 rounded-full animate-ping"></div>
          )}
        </div>
      </div>

      {/* Central router crown */}
      {isCentralRouter && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-6 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg shadow-lg flex items-center justify-center">
            <CommandLineIcon className="h-3 w-3 text-yellow-800" />
          </div>
        </div>
      )}

      {/* Device icon with glow effect */}
      <div className="flex items-center justify-center mb-3 relative">
        <div className={`absolute inset-0 rounded-full blur-lg opacity-30 ${
          isCentralRouter ? 'bg-yellow-400' : 
          isServer ? 'bg-green-400' : 
          isUp ? 'bg-blue-400' : 'bg-gray-400'
      }`}></div>
        <div className="relative z-10">
        {getDeviceIcon(data.type)}
        </div>
      </div>

      {/* Device info */}
      <div className="text-center space-y-1">
        <div className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-24">
          {data.name}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-full">
          {data.ip}
        </div>
        
        {/* Role badges */}
        {isCentralRouter && (
          <div className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-bold shadow-lg">
            {t('topology.centralRouterBadge')}
          </div>
        )}
        
        {isServer && (
          <div className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-green-900 font-bold shadow-lg">
            {t('topology.serverBadge')}
          </div>
        )}
        
        <div className={`text-xs px-3 py-1 rounded-full font-medium shadow-sm ${
          isUp 
            ? 'bg-gradient-to-r from-green-400 to-green-500 text-green-900'
            : 'bg-gradient-to-r from-red-400 to-red-500 text-red-900'
        }`}>
          {isUp ? t('topology.onlineBadge') : t('topology.offlineBadge')}
        </div>
      </div>

      {/* React Flow Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          top: -8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          border: '3px solid white',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          cursor: 'crosshair'
        }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{
          top: -8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          border: '3px solid white',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          cursor: 'crosshair'
        }}
      />
      
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={{
          bottom: -8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          border: '3px solid white',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          cursor: 'crosshair'
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={{
          bottom: -8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          border: '3px solid white',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          cursor: 'crosshair'
        }}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          left: -8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          border: '3px solid white',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          cursor: 'crosshair'
        }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={{
          left: -8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          border: '3px solid white',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          cursor: 'crosshair'
        }}
      />
      
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        style={{
          right: -8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          border: '3px solid white',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          cursor: 'crosshair'
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{
          right: -8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          border: '3px solid white',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          cursor: 'crosshair'
        }}
      />
    </motion.div>
  );
};

const NetworkTopology = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { devices } = useSelector((state) => state.devices);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showControls, setShowControls] = useState(true);
  
  // Layout management states
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [currentLayoutName, setCurrentLayoutName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Node types
  const nodeTypes = useMemo(() => ({
    device: DeviceNode
  }), []);

  // Create network structure: 4 servers + 32 routers (1 central Diskominfo + 31 others)
  const deviceNodes = useMemo(() => {
    const nodes = [];
    
    // Get existing devices
    const servers = devices.filter(d => d.type?.toLowerCase() === 'server');
    const routers = devices.filter(d => d.type?.toLowerCase() === 'router');
    
    const centerX = 500;
    const centerY = 400;
    
    // 1. Create Central Diskominfo Router (always create this)
    const centralRouter = routers.find(r => r.name?.toLowerCase().includes('diskominfo')) || routers[0];
      nodes.push({
      id: centralRouter?._id || 'central-router',
        type: 'device',
      position: { x: centerX, y: centerY },
        data: {
        name: t('topology.defaultCentralRouterName'),
        ip: centralRouter?.ip || '172.16.99.2',
        type: 'router',
        status: centralRouter?.status || 'UP',
        location: centralRouter?.location || t('topology.centralHub'),
        role: 'central'
      }
    });
    
    // 2. Create 4 Servers (use existing + generate missing)
    const serverPositions = [
      { x: centerX, y: centerY - 200 },     // North
      { x: centerX + 200, y: centerY },     // East  
      { x: centerX, y: centerY + 200 },     // South
      { x: centerX - 200, y: centerY }      // West
    ];
    
    for (let i = 0; i < 4; i++) {
      const server = servers[i];
      nodes.push({
        id: server?._id || `server-${i}`,
        type: 'device',
        position: serverPositions[i],
        data: {
          name: server?.name || `${t('topology.server')} - ${i + 1}`,
          ip: server?.ip || `192.168.1.${10 + i}`,
          type: 'server',
          status: server?.status || 'UP',
          location: server?.location || `${t('topology.serverRoom')} ${i + 1}`,
          role: 'server'
        }
      });
    }
    
    // 3. Create 31 Other Routers (use existing + generate missing)
    const otherRouters = routers.filter(r => r._id !== centralRouter?._id);
    const innerRadius = 300;
    const outerRadius = 450;
    
    // First 16 routers in inner circle
    for (let i = 0; i < 16; i++) {
      const router = otherRouters[i];
      const angle = (i / 16) * 2 * Math.PI;
      const position = {
        x: Math.cos(angle) * innerRadius + centerX,
        y: Math.sin(angle) * innerRadius + centerY
      };
      
      nodes.push({
        id: router?._id || `router-inner-${i}`,
        type: 'device',
        position,
        data: {
          name: router?.name || `${t('topology.branchRouter')} ${i + 1}`,
          ip: router?.ip || `192.168.2.${10 + i}`,
          type: 'router',
          status: router?.status || 'UP',
          location: router?.location || `${t('topology.branchOffice')} ${i + 1}`,
          role: 'branch'
        }
      });
    }
    
    // Remaining 15 routers in outer circle
    for (let i = 0; i < 15; i++) {
      const router = otherRouters[16 + i];
      const angle = (i / 15) * 2 * Math.PI;
      const position = {
        x: Math.cos(angle) * outerRadius + centerX,
        y: Math.sin(angle) * outerRadius + centerY
      };
      
      nodes.push({
        id: router?._id || `router-outer-${i}`,
        type: 'device',
        position,
        data: {
          name: router?.name || `${t('topology.remoteRouter')} ${i + 1}`,
          ip: router?.ip || `192.168.3.${10 + i}`,
          type: 'router',
          status: router?.status || 'UP',
          location: router?.location || `${t('topology.remoteSite')} ${i + 1}`,
          role: 'remote'
        }
      });
    }
    
    return nodes;
  }, [devices, t]);

  // Generate edges: All devices connect to central Diskominfo router
  const deviceEdges = useMemo(() => {
    const edges = [];
    
    // Find central Diskominfo router node
    const centralNode = deviceNodes.find(node => node.data.role === 'central');
    
    if (centralNode) {
      // Connect all servers to central router (high-priority connections)
      deviceNodes.forEach((node) => {
        if (node.data.role === 'server') {
          edges.push({
            id: `edge-central-server-${node.id}`,
            source: centralNode.id,
            target: node.id,
            type: 'smoothstep',
            animated: centralNode.data.status === 'UP' && node.data.status === 'UP',
            style: {
              stroke: centralNode.data.status === 'UP' && node.data.status === 'UP' ? '#10B981' : '#EF4444',
              strokeWidth: 5, // Thicker for server connections
              strokeDasharray: 'none'
            },
            data: {
              type: 'server-connection',
              label: t('topology.serverLink'),
              priority: 'high',
              sourceDevice: centralNode.data.name,
              targetDevice: node.data.name
            }
          });
        }
        
        // Connect all other routers to central router
        if (node.data.role === 'branch' || node.data.role === 'remote') {
          const isInnerRouter = node.data.role === 'branch';
          
          edges.push({
            id: `edge-central-router-${node.id}`,
            source: centralNode.id,
            target: node.id,
            type: 'smoothstep',
            animated: centralNode.data.status === 'UP' && node.data.status === 'UP',
            style: {
              stroke: centralNode.data.status === 'UP' && node.data.status === 'UP' 
                ? (isInnerRouter ? '#3B82F6' : '#8B5CF6') 
                : '#EF4444',
              strokeWidth: isInnerRouter ? 4 : 3, // Inner routers get thicker lines
              strokeDasharray: isInnerRouter ? 'none' : '8,4' // Outer routers get dashed lines
            },
            data: {
              type: 'router-connection',
              label: isInnerRouter ? t('topology.branchLink') : t('topology.remoteLink'),
              priority: isInnerRouter ? 'medium' : 'low',
              sourceDevice: centralNode.data.name,
              targetDevice: node.data.name
            }
          });
        }
      });
    }

    return edges;
  }, [deviceNodes, t]);

  // Update nodes and edges when devices change
  React.useEffect(() => {
    setNodes(deviceNodes);
    setEdges(deviceEdges);
  }, [deviceNodes, deviceEdges, setNodes, setEdges]);

  // Load saved layouts from localStorage on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('networkTopologyLayouts');
    if (saved) {
      try {
        setSavedLayouts(JSON.parse(saved));
      } catch (error) {
      }
    }
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
  }, []);

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
      setSelectedNode(node);
  }, []);

  // Handle canvas click
  const onPaneClick = useCallback(() => {
      setSelectedNode(null);
      setSelectedEdge(null);
  }, []);

  // Refresh devices (removed buttons that triggered this)

  // Save current layout
  const saveLayout = useCallback(() => {
    if (!currentLayoutName.trim()) {
      alert(t('topology.enterLayoutName'));
      return;
    }

    const layoutData = {
      id: Date.now().toString(),
      name: currentLayoutName.trim(),
      timestamp: new Date().toISOString(),
      nodes: nodes.map(node => ({
        id: node.id,
        position: node.position,
        data: node.data
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: edge.data
      }))
    };

    const updatedLayouts = [...savedLayouts, layoutData];
    setSavedLayouts(updatedLayouts);
    localStorage.setItem('networkTopologyLayouts', JSON.stringify(updatedLayouts));
    
    setCurrentLayoutName('');
    setShowSaveDialog(false);
    alert(t('topology.layoutSaved', { name: layoutData.name }));
  }, [currentLayoutName, nodes, edges, savedLayouts, t]);

  // Load selected layout
  const loadLayout = useCallback((layout) => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
    setShowLoadDialog(false);
    alert(t('topology.layoutLoaded', { name: layout.name }));
  }, [setNodes, setEdges, t]);

  // Delete saved layout
  const deleteLayout = useCallback((layoutId) => {
    if (window.confirm(t('topology.confirmDeleteLayout'))) {
      const updatedLayouts = savedLayouts.filter(layout => layout.id !== layoutId);
      setSavedLayouts(updatedLayouts);
      localStorage.setItem('networkTopologyLayouts', JSON.stringify(updatedLayouts));
      alert(t('topology.layoutDeleted'));
    }
  }, [savedLayouts, t]);

  // Reset to default layout (button removed)

  // Network statistics based on our structure
  const networkStats = useMemo(() => {
    const stats = {
      totalNodes: deviceNodes.length,
      servers: deviceNodes.filter(n => n.data.role === 'server').length,
      centralRouter: deviceNodes.filter(n => n.data.role === 'central').length,
      branchRouters: deviceNodes.filter(n => n.data.role === 'branch').length,
      remoteRouters: deviceNodes.filter(n => n.data.role === 'remote').length,
      totalConnections: deviceEdges.length,
      up: deviceNodes.filter(n => n.data.status?.toUpperCase() === 'UP').length,
      down: deviceNodes.filter(n => n.data.status?.toUpperCase() === 'DOWN').length
    };

    return stats;
  }, [deviceNodes, deviceEdges]);

  // Header action handlers removed along with buttons

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-6 px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                {t('topology.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('topology.description')}
              </p>
            </div>
            
            {/* Header Buttons removed as requested */}
          </div>
        </div>

        {/* Network Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('topology.totalDevices')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{networkStats.totalNodes}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DeviceTabletIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('topology.onlineDevices')}</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{networkStats.up}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('topology.offlineDevices')}</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{networkStats.down}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('topology.totalConnections')}</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{networkStats.totalConnections}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <LinkIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Network Canvas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700" style={{ height: '800px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.1,
              minZoom: 0.3,
              maxZoom: 1.5
            }}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            attributionPosition="bottom-left"
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"
            nodesDraggable={true}
            minZoom={0.1}
            maxZoom={2}
          >
            {showControls && <Controls />}
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Save Layout Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <CloudArrowUpIcon className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('topology.saveDialog.title')}</h3>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('topology.saveDialog.layoutName')}
                </label>
                <input
                  type="text"
                  value={currentLayoutName}
                  onChange={(e) => setCurrentLayoutName(e.target.value)}
                  placeholder={t('topology.saveDialog.placeholder')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && saveLayout()}
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={saveLayout}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <BookmarkIcon className="h-4 w-4" />
                  {t('topology.saveLayout')}
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setCurrentLayoutName('');
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Load Layout Dialog */}
        {showLoadDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <CloudArrowDownIcon className="h-6 w-6 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('topology.loadDialog.title')}</h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto mb-4">
                {savedLayouts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BookmarkIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t('topology.loadDialog.empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedLayouts.map((layout) => (
                      <div
                        key={layout.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {layout.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {t('topology.savedAt')} {new Date(layout.timestamp).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {t('topology.nodesConnections', { nodes: layout.nodes.length, connections: layout.edges.length })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadLayout(layout)}
                            className="flex items-center gap-1 px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm transition-colors"
                          >
                            <CloudArrowDownIcon className="h-3 w-3" />
                            {t('topology.load')}
                          </button>
                          <button
                            onClick={() => deleteLayout(layout.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                          >
                            <TrashIcon className="h-3 w-3" />
                            {t('topology.delete')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLoadDialog(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Selected Node/Edge Details */}
        {(selectedNode || selectedEdge) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedNode ? t('topology.deviceDetails') : t('topology.connectionDetails')}
              </h3>
              <button
                onClick={() => {
                  setSelectedNode(null);
                  setSelectedEdge(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {selectedNode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.name')}</label>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedNode.data.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.ipAddress')}</label>
                  <p className="text-gray-900 dark:text-white font-mono">{selectedNode.data.ip}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.type')}</label>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedNode.data.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.status')}</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedNode.data.status?.toUpperCase() === 'UP'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {selectedNode.data.status?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.location')}</label>
                  <p className="text-gray-900 dark:text-white">{selectedNode.data.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.nodeId')}</label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedNode.id}</p>
                </div>
              </div>
            ) : selectedEdge && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.connectionType')}</label>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedEdge.data?.type || t('topology.unknown')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.fromDevice')}</label>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedEdge.data?.sourceDevice || t('topology.unknown')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.toDevice')}</label>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedEdge.data?.targetDevice || t('topology.unknown')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.connectionId')}</label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedEdge.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.status')}</label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {t('topology.active')}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topology.fields.style')}</label>
                  <p className="text-gray-900 dark:text-white capitalize">
                    {selectedEdge.data?.type === 'wireless' ? t('topology.dashed') : t('topology.solid')}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Simple Instructions */}
        <div className="mt-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span>🖱️ {t('topology.instructions.dragNodes')}</span>
              <span>🎯 {t('topology.instructions.connectionHandles')}</span>
              <span>💾 {t('topology.instructions.saveLayouts')}</span>
              <span>🔄 {t('topology.instructions.resetDefault')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NetworkTopology;
