$('#mainTab a').on('click', function(e) {
  e.preventDefault()
  $(this).tab('show')
})

const submitButton = document.querySelector('#btn-submit')
const exampleButton = document.querySelector('#btn-example')
const inputFasta = document.querySelector('#fasta')
const inputCharsPerLine = document.querySelector('#chars-per-line')
const resultsContainer = document.querySelector('#results-container')
const resultAlignment = document.querySelector('#result-alignment')
const notification = document.querySelector('#bgen-notification')
const error = document.querySelector('#bgen-error')
const errorMessage = document.querySelector('#error-message')
const resultLink = document.querySelector('#link-results')

submitButton.addEventListener('click', run)
exampleButton.addEventListener('click', showExample)

function run() {
  const sequences = getSequences()
  resultLink.click()

  // if (sequences.length > 0) {
  //   inputLength.value = candidates[0].length;
  //   if (!_.every(candidates, candidate => isDna(candidate))) {
  //     showError("candidate sequences can only contain characters A, C, G, T");
  //     return;
  //   }
  //   if (new Set(candidates.map(candidate => candidate.length)).size !== 1) {
  //     showError("candidate sequences must have the same length");
  //     return;
  //   }
  // }

  hideElement(error)
  showElement(notification)
  hideElement(resultsContainer)

  displayResults(sequences)
}

function getSequences() {
  const fasta = inputFasta.value.trim()
  const sequences = parseMultiFasta(fasta)
  return sequences
}

function showError(message) {
  hideElement(resultsContainer)
  showElement(error)
  errorMessage.textContent = `Error: ${message}`
}

function displayResults(sequences) {
  showElement(resultsContainer)
  const alignmentCharactersPerLine = parseInt(inputCharsPerLine.value, 10)
  const alignment = alignmentHtml(sequences, alignmentCharactersPerLine)
  resultAlignment.innerHTML = alignment
}

function showElement(element) {
  element.classList.remove('d-none')
}

function hideElement(element) {
  element.classList.add('d-none')
}

function alignmentHtml(sequences, n) {
  const chunkedSequences = sequences.map(s => chunked(s.seq, n))
  const widthLabel = Math.max(...sequences.map(s => s.id.length))
  const widthPosition = Math.max(
    ...sequences.map(s => ungapped(s.seq).length.toString().length)
  )
  const offset = {}
  let ret = ''
  zip(...chunkedSequences).forEach((block, i) => {
    const startAlign = i * n + 1
    const widthAlign = Math.min(n, block[0].length)
    const endAlign = startAlign + widthAlign - 1
    ret += `<div class="alignment-block">`
    ret += `<div class="alignment-line">${' '.repeat(
      widthLabel + widthPosition + 3
    )} ${startAlign} ${' '.repeat(
      widthAlign - startAlign.toString().length - endAlign.toString().length - 1
    )}${endAlign}</div>`
    ret += `${block
      .map((line, j) => {
        const id = sequences[j].id
        const subseq = ungapped(line)
        let start = offset[id] ? offset[id] + 1 : 0
        const end = start + subseq.length
        if (offset[id]) {
          offset[id] += subseq.length
        } else if (subseq.length > 0) {
          start = 1
          offset[id] = subseq.length
        }
        return `<div class="alignment-line">${id.padStart(
          widthLabel
        )} [${start.toString().padStart(widthPosition)}] ${line
          .split('')
          .map(char => `<span>${char}</span>`)
          .join('')} [${end.toString().padStart(widthPosition)}] ${id}</div>`
      })
      .join('')}</div>`
    ret += '</div>'
  })
  return ret
}

function chunked(seq, n) {
  const ret = []
  for (let i = 0; i < seq.length; i += n) {
    ret.push(seq.slice(i, i + n))
  }
  return ret
}

function zip() {
  const ret = []
  for (let i = 0; i < arguments[0].length; i += 1) {
    const record = [arguments[0][i]]
    for (let j = 1; j < arguments.length; j += 1) {
      record.push(arguments[j][i])
    }
    ret.push(record)
  }
  return ret
}

function ungapped(seq) {
  return seq.replace(/-/g, '')
}

function parseMultiFasta(str) {
  const lines = str.trim().split('\n')
  const sequences = []
  let header, seq
  for (const line of lines) {
    if (line.startsWith('>')) {
      if (header) {
        sequences.push({
          header,
          id: />\s*(\S+)/.exec(header)[1],
          seq
        })
      }
      header = line
      seq = ''
    } else {
      seq += line
    }
  }
  if (header && seq) {
    sequences.push({
      header,
      id: />\s*(\S+)/.exec(header)[1],
      seq
    })
  }
  return sequences
}

function showExample() {
  setTimeout(() => {
    hideElement(error)
    resultLink.click()
    const sequences = parseMultiFasta(exampleData.trim())
    displayResults(sequences)
  }, 400)
}

const exampleData = `>NFP-NFP2 (reverse)
--------------------------------------------------------------------------------
----------------------TGTCTCTGTGGATTATTCGTGGATAAGTATGTTCATGCATGTATTGCAGACCGATTGC
AACATCCATGGCAATGGTTATTCTCTGAGACCATGTAAGCGAAACCACCGAGTTTGAAGTTTTCGAAGATTCCGAGAACA
ACCACTCTTCAAGTGATCCATTTTCAGCATACTCATAGACCAGAAAACAGTTTCCATCATTGTCAGAAGACACACCCATT
AGTTTCACAAGATTTCCATGGTTTACCTTCTGCAGAATTTTCAGCTCCTCTGAAGCATCTTTTTTGATTTTTTTCACTGC
TAAAACTCTACCATCTATATTAGCCTTGTAAACTGATTCACCAATCTTACAATTGTCACTCAGATTCGTTGTACCTTCCA
TGATTGCATCAATTTCATACATTGTTGGCT--TG---CTTACAT-AACCTGAAACACCTGAAA-GTAA-CTT-ATCT-GC
AGTCTCGGACGATGAAGTACTTCTATTCAGATCTCTTCATTTTGAGACAATATACGTACACAAGTGATAGTGTTAAAACT
AAA-ATGAAAAAAGCACTTGG-----------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
------------------------------------------------------------------------
>NFP-NFP8 (forward)
CACCTTTTGCTGAACTCTTGAGTTGGTTGAAGTTCTAGCCCATCCCGAAATTCGCTATCTTGGCCTTAAAATTTGAGCCA
AGAAGGATATTACTTGTTGTGATGTCTCTGTGGATTATTCGTGGATAAGTATGTTCATGCATGTATTGCAGACCGATTGC
AACATCCATGGCAATGGTTATTCTCTGAGACCATGTAAGCGAAACCACCGAGTTTGAAGTTTTCGAAGATTCCGAGAACA
ACCACTCTTCAAGTGATCCATTTTCAGCATACTCATAGACCAGAAAACAGTTTCCATCATTGTCAGAAGACACACCCATT
AGTTTCACAAGATTTCCATGGTTTACCTTCTGCAGAATTTTCAGCTCCTCTGAAGCATCTTTTTTGATTTTTTTCACTGC
TAAAACTCTACCATCTATATTAGCCTTGTAAACTGATTCACCAATCTTACAATTGTCACTCAGATTCGTTGTACCTTCCA
TGATTGCATCAATTTCATACATTGTTGGCT--TG---CTTACAT-AACCTGAAACACCTGAAA-GTAA-CTT-ATCT-GC
AGTCTCGGACGATGAAGTACTTCTATGCA-ATCTCTTCATTTTGAGACAATATACGTACACAAGTGATAGTGTTAAAACT
AAACATGAAAAAAGCACTTCCTCAGGGT----------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
------------------------------------------------------------------------
>NFP-NFP6 (forward)
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
------------CCTCCGACTATTTCAGGGGTTGAAATTTTTAAATTCAAGACCCTTGGTGATAATTCTGGGTATGAAGT
GATTGAAAGTATGAAGAAGTTGTCACCTTGCTTGATTGAGTAGGTGATATTCGCGAAAGAGTGATTTTTAGTGCAACCAC
AAGTTACAGGTACTAGTAACAGTTGATCTGGAATCAGCTTCTTATCCTCGGCTTCTATGTTACTGGCTTTTGCAATGCGT
AAAGGACTCAAATTAAAAATATCAGATATGTTAGATAGGCTCAA--AAAATTTGGAGACTGAGCTCTGTATGCTACATAG
GTTTCACATGAAGGAGGAGAATCCACAGGGCATGTAAAGTTTGTTTCACTTATATATAGTGGTTGAGCTGAGATGTTAGT
GAGAAAAAACAACATGAGGACAAGAAAAAGAGCATGAGAACTCGAGGGAAGAAAGAAGGCAGACATTGTTGTGAGGAAAT
GCAAATTATGAGGGGAAGAGAAAAGAGAGTTTCTTATGGCAAATAACAACCAAGACTTATTGTCATACTTCT
>NFP-NFP1 (reverse)
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--A-ATGAAAAAAGCACTTCCT-AGACTGATACCAATTATAAGAGCCAGATTTTGACTGCTGCTTTTTCTTCCATTTGAA
GATGGTTGATCAAGTTTTGGTAAACTTGTCACAGGGATCAAAACTGAACGGTTGGTTGAAGCAGTGAAGTTATGATTGTT
TTCAGCTAACATTTCAACTTGTGATGCACCAAACTTTGAACTAATCAAGGGTAACATTGTCATTATCCTGCCACACATAA
GTAATAAGATACTTTATTCCTTTGTTCAATTGATTCTTTGAAGGGCACTTGCAGAATAAAGGGACTGAAACTTTGGTGTC
TAGTGGCAATAGAGTTGGACTTAGATTGGGGTTGAAATTTTTAAATTCAAGATAATTGGTGA-GATTCTGG-TATGAAGT
GATTGAAAGTATGAAGAAGTTGTCACCTTGCTTGATTGAGTAGGTGATATTCGCGAAAGAGTGATTTTTAGTGCAACCAC
AAGTTACAGGTACTAGTAACAGTTGATCTGGAATCAGCTTCTTATCCTCGGCTTCTATGTTACTGGCTTTTGCAATGCGT
AAAGGACTCAAAGTAAAAATATCAGATATGTTAGATAGGCTTAGTCAAAAGGGGGAGACTG-------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
------------------------------------------------------------------------
>NFP-NFP7 (forward)
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
----------------------------CTCCTGTGACTTACATGAACCTGAAACACCTGAAAAGTAAACTTCACCTCGC
AGTCTCGGACGATGAAGTACTTCTATTCA-ATCTCTTCATTTTGAGACAATATACGTACACAAGTGATAGTGTTAAAACT
AAA-ATGAAAAAAGCACTTCCT-AGGCTGATACCAATTATAAGAGCCAGATTTTGACTGCTGCTTTTTCTTCCATTTGAA
GATGGTTGATCAAGTTTTGGTAAACTTGTCACAGGGATCAAAACTGAACGGTTGGTTGAAGCAGTGAAGTTATGATTGTT
TTCAGCTAACATTTCAACTTGTGATGCACCAAACTTTGAACTAA-CAAGGGTAACATTGTCATTATCCTGCCACACATAA
GTAATAAGATACTTTATTCCTTTGTTCAATTGATTCTTTGAAGGGCACTTGCAGAATAAAGGGACTGAAACTTTGGTGTC
TAGTGGCAATAGAGTTGGACTTAGATTGGGGTTGAAATTTTTAAATTCAAGATAATTGGTGA-GATTCTGG-TATGAAGT
GATTGAAAGTATGAAGAAGTTGTCACCTTGCTTGATAGAGTAGGT-----------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
------------------------------------------------------------------------`
