'use client'

import { useEffect, useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useRouter } from 'next/navigation'
import type { DiagramData } from '@/types'

// nodeTypes와 edgeTypes를 컴포넌트 밖에서 정의하여 경고 해결
const nodeTypes = {}
const edgeTypes = {}

export default function KnowledgeGraph() {
  const router = useRouter()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    fetch('/api/diagram')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data: DiagramData) => {
        // API 응답 데이터 검증
        if (!data || !data.nodes || !data.edges) {
          console.warn('Invalid diagram data format:', data)
          return
        }

        const flowNodes: Node[] = data.nodes.map((node, index) => ({
          id: node.id,
          type: 'default',
          data: {
            label: node.label,
            slug: node.slug,
          },
          position: {
            x: Math.random() * 800,
            y: Math.random() * 600,
          },
          style: {
            background: '#fff',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '10px',
            minWidth: 150,
            fontSize: 14,
            fontWeight: 500,
          },
        }))

        const flowEdges: Edge[] = data.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#3b82f6',
            strokeWidth: 2,
          },
          labelStyle: {
            fill: '#6b7280',
            fontWeight: 500,
            fontSize: 12,
          },
        }))

        setNodes(flowNodes)
        setEdges(flowEdges)
      })
      .catch((error) => {
        console.error('Failed to load diagram data:', error)
        // 빈 배열로 초기화하여 오류 상태 표시
        setNodes([])
        setEdges([])
      })
  }, [setNodes, setEdges])

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const slug = node.data.slug
      if (slug) {
        router.push(`/articles/${slug}`)
      }
    },
    [router]
  )

  return (
    <div style={{ width: '100%', height: '100vh' }} className="reactflow-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        selectNodesOnDrag={false}
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  )
}

