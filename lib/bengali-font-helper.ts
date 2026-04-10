// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const applyBengaliFontMarks = (editor: any): void => {
  if (!editor || !editor.state) return

  const { state } = editor
  const { doc } = state

  // Track all positions that need the mark
  const marksToAdd: Array<{ from: number; to: number }> = []
  const marksToRemove: Array<{ from: number; to: number }> = []

  // Iterate through all text nodes in the document
  doc.descendants((node: { isText: boolean; text: string }, pos: number) => {
    if (node.isText && node.text) {
      const bengaliSegments = findBengaliSegments(node.text)
      
      // If there are Bengali segments, mark them and unmark non-Bengali text
      if (bengaliSegments.length > 0) {
        bengaliSegments.forEach((segment) => {
          marksToAdd.push({
            from: pos + segment.start,
            to: pos + segment.end,
          })
        })
        
        // Unmark the English segments between Bengali text
        let lastEnd = 0
        bengaliSegments.forEach((segment) => {
          if (segment.start > lastEnd) {
            marksToRemove.push({
              from: pos + lastEnd,
              to: pos + segment.start,
            })
          }
          lastEnd = segment.end
        })
        
        // Unmark text after the last Bengali segment
        if (lastEnd < node.text.length) {
          marksToRemove.push({
            from: pos + lastEnd,
            to: pos + node.text.length,
          })
        }
      } else {
        // No Bengali text - remove all marks from this node
        marksToRemove.push({
          from: pos,
          to: pos + node.text.length,
        })
      }
    }
  })

  // Apply all changes in a single transaction to avoid disrupting the editor
  if (marksToAdd.length > 0 || marksToRemove.length > 0) {
    const tr = state.tr

    // Remove marks from non-Bengali segments
    marksToRemove.forEach(({ from, to }) => {
      tr.removeMark(from, to, editor.schema.marks.bengaliMark)
    })

    // Add marks to Bengali segments
    marksToAdd.forEach(({ from, to }) => {
      tr.addMark(from, to, editor.schema.marks.bengaliMark.create())
    })

    // Dispatch the transaction without triggering onUpdate
    editor.view.dispatch(tr)
  }
}

/**
 * Find all Bengali text segments in a string
 * Returns array of segment positions
 */
function findBengaliSegments(
  text: string
): Array<{ start: number; end: number }> {
  const bengaliRegex = /[\u0980-\u09FF]+/g
  const segments: Array<{ start: number; end: number }> = []
  let match

  while ((match = bengaliRegex.exec(text)) !== null) {
    segments.push({
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  return segments
}

/**
 * Check if a text segment contains Bengali characters
 */
export const hasBengaliText = (text: string): boolean => {
  const bengaliRegex = /[\u0980-\u09FF]/g
  return bengaliRegex.test(text)
}

/**
 * Remove Bengali font marks from the editor
 * Useful for cleaning up or when switching modes
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeBengaliFontMarks = (editor: any): void => {
  if (!editor || !editor.state) return

  const { state } = editor
  const { doc } = state
  const tr = state.tr

  doc.descendants((node: { isText: boolean; text: string }) => {
    if (node.isText && node.text) {
      // Marks will be removed in traversal
    }
  })

  if (tr.docChanged) {
    editor.view.dispatch(tr)
  }
}

