package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class GroupingId(
    @Embedded
    val voiceId: VoiceId,
    @Column(name = "groupings_order")
    val groupingsOrder: Long,
)

@Entity
data class Grouping(
    @EmbeddedId
    val groupingId: GroupingId,
    @ManyToOne
    @JoinColumns(
        // all columns from VoiceId
        JoinColumn(name = "staff_system_id", insertable = false, updatable = false),
        JoinColumn(name = "staves_order", insertable = false, updatable = false),
        JoinColumn(name = "measures_order", insertable = false, updatable = false),
        JoinColumn(name = "voices_order", insertable = false, updatable = false),
    )
    val voice: Voice,
    @OneToMany(mappedBy = "grouping", cascade = [CascadeType.PERSIST])
    @OrderColumn(name = "grouping_entries_order")
    val groupingEntries: List<GroupingEntry> = emptyList(),
    val metadata: String? = null,
)
